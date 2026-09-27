from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base
from app.database.models.enums import BookingStatus

if TYPE_CHECKING:
    from app.database.models.doctor import Doctor
    from app.database.models.service import Service
    from app.database.models.user import User


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    booking_reference: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id: Mapped[int] = mapped_column(Integer, ForeignKey("doctors.id"), nullable=False)
    service_id: Mapped[int] = mapped_column(Integer, ForeignKey("services.id"), nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime, index=True, nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default=BookingStatus.CONFIRMED.value, nullable=False
    )
    total_price: Mapped[float] = mapped_column(Float, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    cancellation_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(UTC), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="bookings")
    doctor: Mapped["Doctor"] = relationship("Doctor", back_populates="bookings")
    service: Mapped["Service"] = relationship("Service", back_populates="bookings")

    __table_args__ = (
        Index("idx_doctor_time", "doctor_id", "start_time"),
        Index("idx_booking_status", "status"),
    )

    def __repr__(self) -> str:
        return (
            f"<Booking {self.booking_reference} Doc:{self.doctor_id} "
            f"Time:{self.start_time} Status:{self.status}>"
        )
