from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ServiceBase(BaseModel):
    name: str = Field(..., description="Service name")
    description: str = Field(..., description="Service description")
    duration: int = Field(..., gt=0, description="Duration in minutes")
    price: float = Field(..., ge=0, description="Cost in USD")
    icon: str | None = "stethoscope"
    is_active: bool | None = True


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    duration: int | None = None
    price: float | None = None
    icon: str | None = None
    is_active: bool | None = None


class ServiceOut(ServiceBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
