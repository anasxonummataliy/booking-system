from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.database.models import Booking, Doctor, DoctorSchedule, Service
from app.repositories.doctor_repository import DoctorRepository
from app.repositories.schedule_repository import ScheduleRepository
from app.repositories.service_repository import ServiceRepository
from app.schemas.doctor import DoctorCreate, DoctorUpdate
from app.schemas.schedule import ScheduleCreate
from app.schemas.service import ServiceCreate, ServiceUpdate


class CatalogService:
    def __init__(self, db: Session):
        self.service_repo = ServiceRepository(db)
        self.doctor_repo = DoctorRepository(db)
        self.schedule_repo = ScheduleRepository(db)

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

    def update_service(self, service_id: int, data: ServiceUpdate) -> Service:
        service = self.get_service(service_id)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(service, key, value)
        return self.service_repo.update(service)

    def delete_service(self, service_id: int) -> bool:
        service = self.get_service(service_id)
        has_bookings = (
            self.service_repo.db.query(Booking)
            .filter(Booking.service_id == service_id)
            .first()
            is not None
        )
        if has_bookings:
            service.is_active = False
            self.service_repo.update(service)
            return True
        else:
            self.doctor_repo.db.query(Doctor).filter(
                Doctor.service_id == service_id
            ).update({"service_id": None})
            self.service_repo.db.commit()
            return self.service_repo.delete(service_id)

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

    def update_doctor(self, doctor_id: int, data: DoctorUpdate) -> Doctor:
        doctor = self.get_doctor(doctor_id)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(doctor, key, value)
        return self.doctor_repo.update(doctor)

    def delete_doctor(self, doctor_id: int) -> bool:
        doctor = self.get_doctor(doctor_id)
        has_bookings = (
            self.doctor_repo.db.query(Booking)
            .filter(Booking.doctor_id == doctor_id)
            .first()
            is not None
        )
        if has_bookings:
            doctor.is_active = False
            self.doctor_repo.update(doctor)
            return True
        else:
            self.schedule_repo.db.query(DoctorSchedule).filter(
                DoctorSchedule.doctor_id == doctor_id
            ).delete()
            self.doctor_repo.db.commit()
            return self.doctor_repo.delete(doctor_id)

    def list_schedules(self, doctor_id: int) -> list[DoctorSchedule]:
        return self.schedule_repo.get_by_doctor(doctor_id)

    def create_or_update_schedule(self, data: ScheduleCreate) -> DoctorSchedule:
        existing = self.schedule_repo.get_by_doctor_and_day(data.doctor_id, data.day_of_week)
        if existing:
            for key, val in data.model_dump().items():
                setattr(existing, key, val)
            return self.schedule_repo.update(existing)
        new_sched = DoctorSchedule(**data.model_dump())
        return self.schedule_repo.create(new_sched)
