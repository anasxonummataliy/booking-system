from sqlalchemy.orm import Session

from app.database.models import Service
from app.repositories.base import BaseRepository


class ServiceRepository(BaseRepository[Service]):
    def __init__(self, db: Session):
        super().__init__(Service, db)

    def get_by_name(self, name: str) -> Service | None:
        return self.db.query(Service).filter(Service.name == name).first()

    def get_active_services(self) -> list[Service]:
        return self.db.query(Service).filter(Service.is_active).all()
