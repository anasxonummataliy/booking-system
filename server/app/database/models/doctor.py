from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.connection import Base

if TYPE_CHECKING:
    from app.database.models.user import User
    from app.database.models.service import Service
    from app.database.models.schedule import DoctorSchedule
    from app.database.models.booking import Booking


class Doctor(Base):
    __tablename__ = "doctors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    specialty: Mapped[str] = mapped_column(String(255), nullable=False)
    service_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("services.id"), nullable=True)
    bio: Mapped[str] = mapped_column(Text, nullable=False)
    rating: Mapped[float] = mapped_column(Float, default=4.8, nullable=False)
    reviews_count: Mapped[int] = mapped_column(Integer, default=124, nullable=False)
    experience_years: Mapped[int] = mapped_column(Integer, default=8, nullable=False)
    consultation_fee: Mapped[float] = mapped_column(Float, default=30.0, nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    education: Mapped[str] = mapped_column(String(255), default="Tashkent Medical Academy, 2015", nullable=False)
    languages: Mapped[str] = mapped_column(String(255), default="English, Uzbek, Russian", nullable=False)
    location: Mapped[str] = mapped_column(String(255), default="City Medical Center, Tashkent", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="doctor_profile")
    service: Mapped[Optional["Service"]] = relationship("Service", back_populates="doctors")
    schedules: Mapped[List["DoctorSchedule"]] = relationship("DoctorSchedule", back_populates="doctor", cascade="all, delete-orphan")
    bookings: Mapped[List["Booking"]] = relationship("Booking", back_populates="doctor")

    def __repr__(self) -> str:
        return f"<Doctor {self.full_name} ({self.specialty})>"
