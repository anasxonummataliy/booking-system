from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_db
from app.database.models import User
from app.schemas.service import ServiceCreate, ServiceOut, ServiceUpdate
from app.services.catalog_service import CatalogService

router = APIRouter(prefix="/services", tags=["Services"])


@router.get("", response_model=list[ServiceOut])
def get_services(db: Session = Depends(get_db)):
    service = CatalogService(db)
    return service.list_services()


@router.get("/{id}", response_model=ServiceOut)
def get_service_by_id(id: int, db: Session = Depends(get_db)):
    service = CatalogService(db)
    return service.get_service(id)


@router.post("", response_model=ServiceOut)
def create_service(
    data: ServiceCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)
):
    service = CatalogService(db)
    return service.create_service(data)


@router.put("/{id}", response_model=ServiceOut)
def update_service(
    id: int,
    data: ServiceUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = CatalogService(db)
    return service.update_service(id, data)


@router.delete("/{id}")
def delete_service(
    id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)
):
    service = CatalogService(db)
    service.delete_service(id)
    return {"message": "Service successfully deleted"}
