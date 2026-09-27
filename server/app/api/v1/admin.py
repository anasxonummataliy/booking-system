from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_db
from app.database.models import User
from app.schemas.booking import BookingOut, BookingUpdateStatus
from app.services.booking_service import BookingService

router = APIRouter(prefix="/admin", tags=["Admin Portal"])


@router.get("/metrics")
def get_admin_metrics(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    service = BookingService(db)
    return service.get_admin_metrics()


@router.get("/bookings", response_model=list[BookingOut])
def list_all_bookings(
    status: str | None = Query(
        None, description="Filter by status (Pending, Confirmed, Cancelled, Completed)"
    ),
    doctor_id: int | None = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = BookingService(db)
    return service.booking_repo.get_all_bookings(
        status=status, doctor_id=doctor_id, skip=skip, limit=limit
    )


@router.patch("/bookings/{id}/status", response_model=BookingOut)
def update_booking_status(
    id: int,
    data: BookingUpdateStatus,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = BookingService(db)
    return service.update_status(
        booking_id=id, new_status=data.status, reason=data.cancellation_reason
    )
