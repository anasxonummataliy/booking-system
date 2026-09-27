from datetime import time
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Integer, Boolean, Time, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.connection import Base

if TYPE_CHECKING:
    from app.database.models.doctor import Doctor


class DoctorSchedule(Base):
    __tablename__ = "doctor_schedules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    doctor_id: Mapped[int] = mapped_column(Integer, ForeignKey("doctors.id"), nullable=False)
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)  # 0 = Monday, 6 = Sunday
    start_time: Mapped[time] = mapped_column(Time, nullable=False)       # e.g. 09:00:00
    end_time: Mapped[time] = mapped_column(Time, nullable=False)         # e.g. 17:00:00
    break_start: Mapped[Optional[time]] = mapped_column(Time, nullable=True)      # e.g. 13:00:00
    break_end: Mapped[Optional[time]] = mapped_column(Time, nullable=True)        # e.g. 14:00:00
    slot_duration_minutes: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    doctor: Mapped["Doctor"] = relationship("Doctor", back_populates="schedules")

    def __repr__(self) -> str:
        return f"<DoctorSchedule Doctor:{self.doctor_id} Day:{self.day_of_week} ({self.start_time}-{self.end_time})>"
