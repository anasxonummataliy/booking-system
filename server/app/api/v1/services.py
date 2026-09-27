from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_admin
from app.services.catalog_service import CatalogService
from app.schemas.service import ServiceOut, ServiceCreate
from app.database.models import User

router = APIRouter(prefix="/services", tags=["Services"])


@router.get("", response_model=List[ServiceOut])
def get_services(db: Session = Depends(get_db)):
    service = CatalogService(db)
    return service.list_services()


@router.get("/{id}", response_model=ServiceOut)
def get_service_by_id(id: int, db: Session = Depends(get_db)):
    service = CatalogService(db)
    return service.get_service(id)


@router.post("", response_model=ServiceOut)
def create_service(
    data: ServiceCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    service = CatalogService(db)
    return service.create_service(data)
