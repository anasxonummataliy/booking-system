from typing import List, Optional
from sqlalchemy.orm import Session
from app.database.models import DoctorSchedule
from app.repositories.base import BaseRepository


class ScheduleRepository(BaseRepository[DoctorSchedule]):
    def __init__(self, db: Session):
        super().__init__(DoctorSchedule, db)

    def get_by_doctor(self, doctor_id: int) -> List[DoctorSchedule]:
        return self.db.query(DoctorSchedule).filter(
            DoctorSchedule.doctor_id == doctor_id,
            DoctorSchedule.is_active == True
        ).all()

    def get_by_doctor_and_day(self, doctor_id: int, day_of_week: int) -> Optional[DoctorSchedule]:
        return self.db.query(DoctorSchedule).filter(
            DoctorSchedule.doctor_id == doctor_id,
            DoctorSchedule.day_of_week == day_of_week,
            DoctorSchedule.is_active == True
        ).first()
