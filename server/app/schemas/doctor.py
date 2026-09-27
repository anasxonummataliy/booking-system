from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.schedule import ScheduleOut
from app.schemas.service import ServiceOut


class DoctorBase(BaseModel):
    full_name: str
    specialty: str
    service_id: int | None = None
    bio: str
    rating: float | None = 4.8
    reviews_count: int | None = 124
    experience_years: int | None = 8
    consultation_fee: float = 30.0
    avatar_url: str | None = None
    education: str | None = "Tashkent Medical Academy, 2015"
    languages: str | None = "English, Uzbek, Russian"
    location: str | None = "City Medical Center, Tashkent"
    is_active: bool | None = True


class DoctorCreate(DoctorBase):
    user_id: int | None = None


class DoctorUpdate(BaseModel):
    full_name: str | None = None
    specialty: str | None = None
    service_id: int | None = None
    bio: str | None = None
    rating: float | None = None
    reviews_count: int | None = None
    experience_years: int | None = None
    consultation_fee: float | None = None
    avatar_url: str | None = None
    education: str | None = None
    languages: str | None = None
    location: str | None = None
    is_active: bool | None = None


class DoctorOut(DoctorBase):
    id: int
    user_id: int | None = None
    created_at: datetime
    service: ServiceOut | None = None

    model_config = ConfigDict(from_attributes=True)


class DoctorDetailOut(DoctorOut):
    schedules: list[ScheduleOut] = []

    model_config = ConfigDict(from_attributes=True)
