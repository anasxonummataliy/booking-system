from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: str | None = None
    role: str = "user"


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    phone: str | None = None
    password: str
    role: str | None = "user"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(UserBase):
    id: int
    is_active: bool
    two_factor_enabled: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class TokenPayload(BaseModel):
    sub: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class Toggle2FARequest(BaseModel):
    enabled: bool


class MessageResponse(BaseModel):
    message: str
    two_factor_enabled: bool | None = None

