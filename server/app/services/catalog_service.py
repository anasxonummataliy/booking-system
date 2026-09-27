from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.database.models import Doctor, Service
from app.repositories.doctor_repository import DoctorRepository
from app.repositories.service_repository import ServiceRepository
from app.schemas.doctor import DoctorCreate
from app.schemas.service import ServiceCreate


class CatalogService:
    def __init__(self, db: Session):
        self.service_repo = ServiceRepository(db)
        self.doctor_repo = DoctorRepository(db)

    def list_services(self) -> list[Service]:
        return self.service_repo.get_active_services()

    def get_service(self, service_id: int) -> Service:
        service = self.service_repo.get(service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Service not found")
        return service

    def create_service(self, data: ServiceCreate) -> Service:
        existing = self.service_repo.get_by_name(data.name)
        if existing:
            raise HTTPException(status_code=400, detail="Service with this name already exists")
        new_svc = Service(**data.model_dump())
        return self.service_repo.create(new_svc)

    def list_doctors(self, specialty: str | None = None) -> list[Doctor]:
        return self.doctor_repo.get_all_with_service(specialty=specialty)

    def get_doctor(self, doctor_id: int) -> Doctor:
        doctor = self.doctor_repo.get_with_schedules(doctor_id)
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
        return doctor

    def create_doctor(self, data: DoctorCreate) -> Doctor:
        new_doc = Doctor(**data.model_dump())
        return self.doctor_repo.create(new_doc)
