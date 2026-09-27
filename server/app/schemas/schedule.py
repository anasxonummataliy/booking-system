from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import time


class ScheduleBase(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6, description="0=Monday, 6=Sunday")
    start_time: time
    end_time: time
    break_start: Optional[time] = None
    break_end: Optional[time] = None
    slot_duration_minutes: int = 30
    is_active: bool = True


class ScheduleCreate(ScheduleBase):
    doctor_id: int


class ScheduleOut(ScheduleBase):
    id: int
    doctor_id: int

    model_config = ConfigDict(from_attributes=True)


class AvailableSlot(BaseModel):
    start_time: str
    end_time: str
    display_time: str
    is_available: bool = True
