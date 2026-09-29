import uuid
from datetime import date, datetime, time, timedelta
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.database.models import Booking, BookingStatus
from app.repositories.booking_repository import (
    BookingRepository,
    SlotAlreadyBookedException,
)
from app.repositories.doctor_repository import DoctorRepository
from app.repositories.schedule_repository import ScheduleRepository
from app.repositories.service_repository import ServiceRepository
from app.schemas.booking import BookingCreate


class BookingService:
    def __init__(self, db: Session):
        self.db = db
        self.booking_repo = BookingRepository(db)
        self.doctor_repo = DoctorRepository(db)
        self.service_repo = ServiceRepository(db)
        self.schedule_repo = ScheduleRepository(db)

    def get_available_slots(self, doctor_id: int, target_date: date) -> list[dict[str, Any]]:
        doctor = self.doctor_repo.get(doctor_id)
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")

        # Find schedule for the target day of week (0=Mon, 6=Sun)
        day_of_week = target_date.weekday()
        schedule = self.schedule_repo.get_by_doctor_and_day(doctor_id, day_of_week)

        # If doctor doesn't have an explicit schedule for this day,
        # default to 09:00 - 17:00 (Mon-Sat)
        if not schedule:
            if day_of_week == 6:  # Sunday closed by default
                return []
            start_t = time(9, 0)
            end_t = time(17, 0)
            break_s = time(13, 0)
            break_e = time(14, 0)
            slot_duration = 30
        else:
            start_t = schedule.start_time
            end_t = schedule.end_time
            break_s = schedule.break_start
            break_e = schedule.break_end
            slot_duration = schedule.slot_duration_minutes or 30

        # Query existing active bookings for that doctor on target_date
        range_start = datetime.combine(target_date, time.min)
        range_end = datetime.combine(target_date, time.max)
        existing_bookings = self.booking_repo.get_doctor_bookings_for_date_range(
            doctor_id, range_start, range_end
        )

        slots = []
        current_time_dt = datetime.combine(target_date, start_t)
        end_time_dt = datetime.combine(target_date, end_t)

        now_utc = datetime.now()

        while current_time_dt + timedelta(minutes=slot_duration) <= end_time_dt:
            slot_start = current_time_dt
            slot_end = current_time_dt + timedelta(minutes=slot_duration)

            # Check if falls within break
            is_break = False
            if break_s and break_e:
                break_start_dt = datetime.combine(target_date, break_s)
                break_end_dt = datetime.combine(target_date, break_e)
                if not (slot_end <= break_start_dt or slot_start >= break_end_dt):
                    is_break = True

            # Check if conflicts with existing bookings
            is_booked = False
            if not is_break:
                for b in existing_bookings:
                    # check overlap
                    if b.start_time < slot_end and b.end_time > slot_start:
                        is_booked = True
                        break

            # If date is today, check if slot is already in the past
            is_past = False
            if target_date == date.today() and slot_start < now_utc:
                is_past = True

            is_available = (not is_break) and (not is_booked) and (not is_past)

            slots.append(
                {
                    "start_time": slot_start.isoformat(),
                    "end_time": slot_end.isoformat(),
                    "display_time": slot_start.strftime("%H:%M"),
                    "is_available": is_available,
                    "reason": "booked"
                    if is_booked
                    else ("break" if is_break else ("past" if is_past else "available")),
                }
            )

            current_time_dt += timedelta(minutes=slot_duration)

        return slots

    def create_booking(self, user_id: int, data: BookingCreate) -> Booking:
        doctor = self.doctor_repo.get(data.doctor_id)
        if not doctor or not doctor.is_active:
            raise HTTPException(status_code=404, detail="Doctor not found or inactive")

        service = self.service_repo.get(data.service_id)
        if not service or not service.is_active:
            raise HTTPException(status_code=404, detail="Service not found or inactive")

        start_time = data.start_time
        # Strip timezone awareness if naive comparisons needed or normalize
        if start_time.tzinfo is not None:
            start_time = start_time.replace(tzinfo=None)

        duration = service.duration or 30
        end_time = start_time + timedelta(minutes=duration)

        # Generate unique human-readable booking reference (e.g. HP-2025-4891)
        ref_uuid = uuid.uuid4().hex[:6].upper()
        reference = f"HP-{start_time.year}-{ref_uuid}"

        total_price = float(doctor.consultation_fee or service.price or 30.0)

        new_booking = Booking(
            booking_reference=reference,
            user_id=user_id,
            doctor_id=doctor.id,
            service_id=service.id,
            start_time=start_time,
            end_time=end_time,
            status=BookingStatus.PENDING.value,
            total_price=total_price,
            notes=data.notes,
        )

        try:
            created = self.booking_repo.create_booking_with_concurrency_lock(new_booking)
            return created
        except SlotAlreadyBookedException as e:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e)) from e

    def cancel_booking(
        self, booking_id: int, user_id: int, is_admin: bool = False, reason: str | None = None
    ) -> Booking:
        booking = self.booking_repo.get(booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        # Permission check: must be owner or admin
        if not is_admin and booking.user_id != user_id:
            raise HTTPException(
                status_code=403, detail="You do not have permission to cancel this booking"
            )

        # Cancellation policy: cannot cancel already completed bookings
        if booking.status == BookingStatus.COMPLETED.value:
            raise HTTPException(
                status_code=400, detail="Completed appointments cannot be cancelled."
            )

        if booking.status == BookingStatus.CANCELLED.value:
            return booking

        booking.status = BookingStatus.CANCELLED.value
        booking.cancellation_reason = reason or "Cancelled by user"
        return self.booking_repo.update(booking)

    def update_status(self, booking_id: int, new_status: str, reason: str | None = None) -> Booking:
        booking = self.booking_repo.get(booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        valid_statuses = [s.value for s in BookingStatus]
        if new_status not in valid_statuses:
            raise HTTPException(
                status_code=400, detail=f"Invalid status. Choose from: {valid_statuses}"
            )

        if booking.status == BookingStatus.COMPLETED.value and new_status == BookingStatus.CANCELLED.value:
            raise HTTPException(
                status_code=400,
                detail="Yakunlangan qabulni bekor qilib bo'lmaydi / Cannot cancel an already completed appointment",
            )

        booking.status = new_status
        if reason:
            booking.cancellation_reason = reason
        return self.booking_repo.update(booking)

    def get_admin_metrics(self) -> dict[str, Any]:
        total = self.booking_repo.db.query(Booking).count()
        confirmed = self.booking_repo.count_by_status(BookingStatus.CONFIRMED.value)
        pending = self.booking_repo.count_by_status(BookingStatus.PENDING.value)
        cancelled = self.booking_repo.count_by_status(BookingStatus.CANCELLED.value)
        completed = self.booking_repo.count_by_status(BookingStatus.COMPLETED.value)

        # Calculate revenue from confirmed and completed bookings
        bookings = (
            self.booking_repo.db.query(Booking)
            .filter(
                Booking.status.in_([BookingStatus.CONFIRMED.value, BookingStatus.COMPLETED.value])
            )
            .all()
        )
        total_revenue = sum(b.total_price for b in bookings)

        # Overview curve for last 7 days
        today = date.today()
        chart_data = []
        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            day_start = datetime.combine(d, time.min)
            day_end = datetime.combine(d, time.max)
            count = (
                self.booking_repo.db.query(Booking)
                .filter(Booking.created_at >= day_start, Booking.created_at <= day_end)
                .count()
            )
            chart_data.append({"date": d.strftime("%b %d"), "bookings": count})

        return {
            "total_bookings": total,
            "confirmed_bookings": confirmed,
            "pending_bookings": pending,
            "cancelled_bookings": cancelled,
            "completed_bookings": completed,
            "total_revenue": total_revenue,
            "chart_data": chart_data,
        }
