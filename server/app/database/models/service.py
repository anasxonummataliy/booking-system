from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base

if TYPE_CHECKING:
    from app.database.models.booking import Booking
    from app.database.models.doctor import Doctor


class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    duration: Mapped[int] = mapped_column(Integer, nullable=False)  # in minutes
    price: Mapped[float] = mapped_column(Float, nullable=False)
    icon: Mapped[str] = mapped_column(String(50), default="stethoscope", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(UTC), nullable=False
    )

    doctors: Mapped[list["Doctor"]] = relationship("Doctor", back_populates="service")
    bookings: Mapped[list["Booking"]] = relationship("Booking", back_populates="service")

    def __repr__(self) -> str:
        return f"<Service {self.name} (${self.price}, {self.duration}m)>"
