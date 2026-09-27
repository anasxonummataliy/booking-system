from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.database.models import User
from app.database.models.enums import UserRole
from app.schemas.booking import BookingCreate, BookingOut
from app.services.booking_service import BookingService

router = APIRouter(prefix="/bookings", tags=["Bookings"])


class CancelRequest(BaseModel):
    reason: str | None = "Cancelled by patient"


@router.post("", response_model=BookingOut)
def create_appointment(
    data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == UserRole.ADMIN or str(current_user.role).lower() == "admin" or getattr(current_user, "is_admin", False):
        raise HTTPException(
            status_code=403,
            detail="Admin hisobidan buyurtma/qabul qilish taqiqlangan. Adminlar qabullarni faqat boshqarishi mumkin / Administrators cannot book appointments.",
        )
    service = BookingService(db)
    return service.create_booking(user_id=current_user.id, data=data)


@router.get("/my", response_model=list[BookingOut])
def get_my_appointments(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    service = BookingService(db)
    return service.booking_repo.get_user_bookings(user_id=current_user.id)


@router.get("/{id}", response_model=BookingOut)
def get_appointment(
    id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    service = BookingService(db)
    booking = service.booking_repo.get(id)
    if not booking:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Booking not found")
    if current_user.role != "admin" and booking.user_id != current_user.id:
        from fastapi import HTTPException

        raise HTTPException(status_code=403, detail="Forbidden")
    return booking


@router.post("/{id}/cancel", response_model=BookingOut)
def cancel_appointment(
    id: int,
    payload: CancelRequest = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reason = payload.reason if payload else "Cancelled by patient"
    service = BookingService(db)
    is_admin = current_user.role == "admin"
    return service.cancel_booking(
        booking_id=id, user_id=current_user.id, is_admin=is_admin, reason=reason
    )
