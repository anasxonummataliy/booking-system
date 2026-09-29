from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.database.models import Doctor, Service
from app.repositories.base import BaseRepository

SPECIALTY_MAPPINGS = {
    "cardiology": ["cardio", "kardiolog", "kardiologiya", "cardiology", "yurak"],
    "general": ["general", "umumiy", "terapevt", "oilaviy", "checkup"],
    "dermatology": ["dermatolog", "dermatologiya", "dermatology", "teri", "kosmetolog"],
    "pediatrics": ["pediatr", "bolalar", "pediatriya", "pediatrics"],
    "gynecology": ["ginekolog", "ginekologiya", "gynecology", "akusher", "ayollar"],
    "orthopedics": ["ortoped", "travmatolog", "ortopediya", "orthopedics"],
}


class DoctorRepository(BaseRepository[Doctor]):
    def __init__(self, db: Session):
        super().__init__(Doctor, db)

    def get_all_with_service(self, specialty: str | None = None) -> list[Doctor]:
        query = self.db.query(Doctor).options(joinedload(Doctor.service)).filter(Doctor.is_active)

        if specialty and specialty.lower() != "all":
            spec_clean = specialty.lower().strip()
            keywords = {spec_clean}
            for group, terms in SPECIALTY_MAPPINGS.items():
                if spec_clean == group or spec_clean in terms or any(t in spec_clean for t in terms):
                    keywords.update(terms)

            conds = []
            for kw in keywords:
                conds.append(Doctor.specialty.ilike(f"%{kw}%"))
                conds.append(Service.name.ilike(f"%{kw}%"))

            query = query.outerjoin(Doctor.service).filter(or_(*conds))

        return query.all()

    def get_with_schedules(self, doctor_id: int) -> Doctor | None:
        return (
            self.db.query(Doctor)
            .options(joinedload(Doctor.service), joinedload(Doctor.schedules))
            .filter(Doctor.id == doctor_id, Doctor.is_active)
            .first()
        )
