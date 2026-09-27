from sqlalchemy.orm import Session

from app.database.models import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email.lower().strip()).first()

    def get_by_role(self, role: str) -> list[User]:
        return self.db.query(User).filter(User.role == role).all()
