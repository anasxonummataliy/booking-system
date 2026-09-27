from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from app.schemas.user import UserOut
from app.schemas.doctor import DoctorOut
from app.schemas.service import ServiceOut


class BookingCreate(BaseModel):
    doctor_id: int
    service_id: int
    start_time: datetime
    notes: Optional[str] = None


class BookingUpdateStatus(BaseModel):
    status: str = Field(..., description="Pending, Confirmed, Cancelled, Completed")
    cancellation_reason: Optional[str] = None


class BookingOut(BaseModel):
    id: int
    booking_reference: str
    user_id: int
    doctor_id: int
    service_id: int
    start_time: datetime
    end_time: datetime
    status: str
    total_price: float
    notes: Optional[str] = None
    cancellation_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    user: Optional[UserOut] = None
    doctor: Optional[DoctorOut] = None
    service: Optional[ServiceOut] = None

    model_config = ConfigDict(from_attributes=True)


class AdminStats(BaseModel):
    total_bookings: int
    confirmed_bookings: int
    pending_bookings: int
    cancelled_bookings: int
    completed_bookings: int
    total_revenue: float
