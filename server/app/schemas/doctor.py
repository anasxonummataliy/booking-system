from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.schemas.service import ServiceOut
from app.schemas.schedule import ScheduleOut


class DoctorBase(BaseModel):
    full_name: str
    specialty: str
    service_id: Optional[int] = None
    bio: str
    rating: Optional[float] = 4.8
    reviews_count: Optional[int] = 124
    experience_years: Optional[int] = 8
    consultation_fee: float = 30.0
    avatar_url: Optional[str] = None
    education: Optional[str] = "Tashkent Medical Academy, 2015"
    languages: Optional[str] = "English, Uzbek, Russian"
    location: Optional[str] = "City Medical Center, Tashkent"
    is_active: Optional[bool] = True


class DoctorCreate(DoctorBase):
    user_id: Optional[int] = None


class DoctorUpdate(BaseModel):
    full_name: Optional[str] = None
    specialty: Optional[str] = None
    service_id: Optional[int] = None
    bio: Optional[str] = None
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    experience_years: Optional[int] = None
    consultation_fee: Optional[float] = None
    avatar_url: Optional[str] = None
    education: Optional[str] = None
    languages: Optional[str] = None
    location: Optional[str] = None
    is_active: Optional[bool] = None


class DoctorOut(DoctorBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    service: Optional[ServiceOut] = None

    model_config = ConfigDict(from_attributes=True)


class DoctorDetailOut(DoctorOut):
    schedules: List[ScheduleOut] = []

    model_config = ConfigDict(from_attributes=True)
