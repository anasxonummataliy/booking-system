from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.database.models import User, UserRole
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserLogin


class AuthService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)

    def register(self, data: UserCreate) -> dict:
        existing = self.user_repo.get_by_email(data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ushbu email bilan foydalanuvchi mavjud / A user with this email address already exists.",
            )

        hashed = hash_password(data.password)
        new_user = User(
            email=data.email.lower().strip(),
            full_name=data.full_name.strip(),
            phone=data.phone,
            hashed_password=hashed,
            role=data.role or UserRole.USER.value,
            is_active=True,
        )
        created_user = self.user_repo.create(new_user)
        access_token = create_access_token(subject=str(created_user.id))
        return {"access_token": access_token, "token_type": "bearer", "user": created_user}

    def login(self, data: UserLogin) -> dict:
        user = self.user_repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email manzili yoki parol noto'g'ri / Incorrect email or password.",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Ushbu hisob faolsizlantirilgan / Your user account has been deactivated.",
            )

        access_token = create_access_token(subject=str(user.id))
        return {"access_token": access_token, "token_type": "bearer", "user": user}
