from datetime import datetime, timezone
from typing import List, TYPE_CHECKING
from sqlalchemy import String, Integer, Float, Text, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.connection import Base

if TYPE_CHECKING:
    from app.database.models.doctor import Doctor
    from app.database.models.booking import Booking


class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    duration: Mapped[int] = mapped_column(Integer, nullable=False)  # in minutes
    price: Mapped[float] = mapped_column(Float, nullable=False)
    icon: Mapped[str] = mapped_column(String(50), default="stethoscope", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    doctors: Mapped[List["Doctor"]] = relationship("Doctor", back_populates="service")
    bookings: Mapped[List["Booking"]] = relationship("Booking", back_populates="service")

    def __repr__(self) -> str:
        return f"<Service {self.name} (${self.price}, {self.duration}m)>"
