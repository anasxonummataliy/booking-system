import threading
from datetime import datetime

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.database.models import Booking, BookingStatus, Doctor
from app.repositories.base import BaseRepository

# Concurrency lock to serialize conflicting slot evaluations across threads
_booking_lock = threading.Lock()


class SlotAlreadyBookedException(Exception):
    """Raised when a time slot has already been booked by another user."""

    def __init__(
        self, message: str = "This time slot is already booked. Please choose another time."
    ):
        self.message = message
        super().__init__(self.message)


class BookingRepository(BaseRepository[Booking]):
    def __init__(self, db: Session):
        super().__init__(Booking, db)

    def auto_expire_pending_bookings(
        self, user_id: int | None = None, doctor_id: int | None = None
    ) -> int:
        """
        Sana o'tib ketgan va tasdiqlanmagan (Pending) barcha bronlarni 
        avtomatik tarzda bekor qilingan (Muddati o'tgan) deb belgilaydi.
        """
        now = datetime.now()
        query = self.db.query(Booking).filter(
            Booking.status == BookingStatus.PENDING.value,
            Booking.start_time < now,
        )
        if user_id is not None:
            query = query.filter(Booking.user_id == user_id)
        if doctor_id is not None:
            query = query.filter(Booking.doctor_id == doctor_id)

        expired_list = query.all()
        if expired_list:
            for b in expired_list:
                b.status = BookingStatus.CANCELLED.value
                b.cancellation_reason = "Muddati o'tgan (tasdiqlanmadi)"
            self.db.commit()
            return len(expired_list)
        return 0

    def get_by_reference(self, reference: str) -> Booking | None:
        self.auto_expire_pending_bookings()
        return (
            self.db.query(Booking)
            .options(
                joinedload(Booking.doctor), joinedload(Booking.service), joinedload(Booking.user)
            )
            .filter(Booking.booking_reference == reference)
            .first()
        )

    def get_user_bookings(self, user_id: int) -> list[Booking]:
        self.auto_expire_pending_bookings(user_id=user_id)
        return (
            self.db.query(Booking)
            .options(joinedload(Booking.doctor), joinedload(Booking.service))
            .filter(Booking.user_id == user_id)
            .order_by(Booking.start_time.desc())
            .all()
        )

    def get_all_bookings(
        self,
        status: str | None = None,
        doctor_id: int | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Booking]:
        self.auto_expire_pending_bookings(doctor_id=doctor_id)
        query = self.db.query(Booking).options(
            joinedload(Booking.doctor), joinedload(Booking.service), joinedload(Booking.user)
        )
        if status and status.lower() != "all":
            query = query.filter(Booking.status == status)
        if doctor_id:
            query = query.filter(Booking.doctor_id == doctor_id)

        return query.order_by(Booking.start_time.desc()).offset(skip).limit(limit).all()

    def count_by_status(self, status: str) -> int:
        return self.db.query(Booking).filter(Booking.status == status).count()

    def get_doctor_bookings_for_date_range(
        self, doctor_id: int, range_start: datetime, range_end: datetime
    ) -> list[Booking]:
        return (
            self.db.query(Booking)
            .filter(
                Booking.doctor_id == doctor_id,
                Booking.status != BookingStatus.CANCELLED.value,
                Booking.start_time >= range_start,
                Booking.start_time < range_end,
            )
            .all()
        )

    def create_booking_with_concurrency_lock(self, booking: Booking) -> Booking:
        """
        Concurrency-safe booking creation:
        1. Thread lock serializes concurrent evaluations within the process.
        2. In PostgreSQL, row-level lock (with_for_update) serializes across worker processes.
        3. Queries for any overlapping non-cancelled bookings.
        4. Commits safely or raises SlotAlreadyBookedException with HTTP 409.
        """
        with _booking_lock:
            try:
                is_postgres = self.db.bind.dialect.name == "postgresql"
                if is_postgres:
                    self.db.query(Doctor).filter(
                        Doctor.id == booking.doctor_id
                    ).with_for_update().first()

                # Check for overlapping non-cancelled bookings
                conflict = (
                    self.db.query(Booking)
                    .filter(
                        Booking.doctor_id == booking.doctor_id,
                        Booking.status != BookingStatus.CANCELLED.value,
                        Booking.start_time < booking.end_time,
                        Booking.end_time > booking.start_time,
                    )
                    .first()
                )

                if conflict:
                    t_start = booking.start_time.strftime("%H:%M")
                    t_end = booking.end_time.strftime("%H:%M")
                    raise SlotAlreadyBookedException(
                        f"Selected slot ({t_start} - {t_end}) is no longer available. "
                        "Another patient just booked it."
                    )

                self.db.add(booking)
                self.db.commit()
                self.db.refresh(booking)
                return booking

            except IntegrityError as err:
                self.db.rollback()
                raise SlotAlreadyBookedException(
                    "Slot reservation conflict occurred. Please pick another slot."
                ) from err
            except Exception:
                self.db.rollback()
                raise
