from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_db
from app.database.models import User
from app.schemas.doctor import DoctorCreate, DoctorDetailOut, DoctorOut, DoctorUpdate
from app.schemas.schedule import ScheduleCreate, ScheduleOut
from app.services.booking_service import BookingService
from app.services.catalog_service import CatalogService

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.get("", response_model=list[DoctorOut])
def get_doctors(
    specialty: str | None = Query(
        None, description="Filter by specialty (e.g. Cardiology, Dermatology)"
    ),
    db: Session = Depends(get_db),
):
    catalog = CatalogService(db)
    return catalog.list_doctors(specialty=specialty)


@router.get("/{id}", response_model=DoctorDetailOut)
def get_doctor_by_id(id: int, db: Session = Depends(get_db)):
    catalog = CatalogService(db)
    return catalog.get_doctor(id)


@router.get("/{id}/slots")
def get_doctor_available_slots(
    id: int,
    target_date: date | None = Query(
        default=None, alias="date", description="Target appointment date (YYYY-MM-DD)"
    ),
    db: Session = Depends(get_db),
):
    if not target_date:
        target_date = date.today()
    booking_service = BookingService(db)
    return booking_service.get_available_slots(doctor_id=id, target_date=target_date)


@router.post("", response_model=DoctorOut)
def create_doctor(
    data: DoctorCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)
):
    catalog = CatalogService(db)
    return catalog.create_doctor(data)


@router.put("/{id}", response_model=DoctorOut)
def update_doctor(
    id: int,
    data: DoctorUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    catalog = CatalogService(db)
    return catalog.update_doctor(id, data)


@router.delete("/{id}")
def delete_doctor(
    id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)
):
    catalog = CatalogService(db)
    catalog.delete_doctor(id)
    return {"message": "Doctor successfully deleted"}


@router.get("/{id}/schedules", response_model=list[ScheduleOut])
def get_doctor_schedules(id: int, db: Session = Depends(get_db)):
    catalog = CatalogService(db)
    return catalog.list_schedules(id)


@router.post("/{id}/schedules", response_model=ScheduleOut)
def create_or_update_schedule(
    id: int,
    data: ScheduleCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    data.doctor_id = id
    catalog = CatalogService(db)
    return catalog.create_or_update_schedule(data)
