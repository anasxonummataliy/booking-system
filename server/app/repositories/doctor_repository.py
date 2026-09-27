from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from app.database.models import Doctor
from app.repositories.base import BaseRepository


class DoctorRepository(BaseRepository[Doctor]):
    def __init__(self, db: Session):
        super().__init__(Doctor, db)

    def get_all_with_service(self, specialty: Optional[str] = None) -> List[Doctor]:
        query = self.db.query(Doctor).options(
            joinedload(Doctor.service)
        ).filter(Doctor.is_active == True)
        
        if specialty and specialty.lower() != "all":
            query = query.filter(Doctor.specialty.ilike(f"%{specialty}%"))
            
        return query.all()

    def get_with_schedules(self, doctor_id: int) -> Optional[Doctor]:
        return self.db.query(Doctor).options(
            joinedload(Doctor.service),
            joinedload(Doctor.schedules)
        ).filter(Doctor.id == doctor_id, Doctor.is_active == True).first()
