from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class ServiceBase(BaseModel):
    name: str = Field(..., description="Service name")
    description: str = Field(..., description="Service description")
    duration: int = Field(..., gt=0, description="Duration in minutes")
    price: float = Field(..., ge=0, description="Cost in USD")
    icon: Optional[str] = "stethoscope"
    is_active: Optional[bool] = True


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[int] = None
    price: Optional[float] = None
    icon: Optional[str] = None
    is_active: Optional[bool] = None


class ServiceOut(ServiceBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
