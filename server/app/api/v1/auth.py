from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.security import hash_password, verify_password
from app.database.models import User
from app.schemas.user import (
    ChangePasswordRequest,
    MessageResponse,
    Toggle2FARequest,
    Token,
    UserCreate,
    UserLogin,
    UserOut,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token)
def register(data: UserCreate, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.register(data)


@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.login(data)


@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Joriy parol noto'g'ri kiritildi.",
        )
    if len(data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak.",
        )
    current_user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Parol muvaffaqiyatli o'zgartirildi!"}


@router.post("/toggle-2fa", response_model=MessageResponse)
def toggle_2fa(
    data: Toggle2FARequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.two_factor_enabled = data.enabled
    db.commit()
    msg = (
        "Ikki bosqichli autentifikatsiya (2FA) yoqildi!"
        if data.enabled
        else "Ikki bosqichli autentifikatsiya (2FA) o'chirildi."
    )
    return {"message": msg, "two_factor_enabled": data.enabled}

