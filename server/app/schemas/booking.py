from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.doctor import DoctorOut
from app.schemas.service import ServiceOut
from app.schemas.user import UserOut


class BookingCreate(BaseModel):
    doctor_id: int
    service_id: int
    start_time: datetime
    notes: str | None = None


class BookingUpdateStatus(BaseModel):
    status: str = Field(..., description="Pending, Confirmed, Cancelled, Completed")
    cancellation_reason: str | None = None


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
    notes: str | None = None
    cancellation_reason: str | None = None
    created_at: datetime
    updated_at: datetime

    user: UserOut | None = None
    doctor: DoctorOut | None = None
    service: ServiceOut | None = None

    model_config = ConfigDict(from_attributes=True)


class AdminStats(BaseModel):
    total_bookings: int
    confirmed_bookings: int
    pending_bookings: int
    cancelled_bookings: int
    completed_bookings: int
    total_revenue: float
