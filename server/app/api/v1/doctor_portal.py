from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_doctor, get_db
from app.database.models import User
from app.database.models.doctor import Doctor
from app.schemas.booking import BookingOut, BookingUpdateStatus
from app.services.booking_service import BookingService

router = APIRouter(prefix="/doctor", tags=["Doctor Portal"])


@router.get("/me")
def get_my_doctor_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_doctor),
):
    """Doctor o'z profilini ko'radi"""
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        return {"error": "Doctor profile not linked to this account"}
    return {
        "id": doctor.id,
        "full_name": doctor.full_name,
        "specialty": doctor.specialty,
        "bio": doctor.bio,
        "rating": doctor.rating,
        "reviews_count": doctor.reviews_count,
        "experience_years": doctor.experience_years,
        "consultation_fee": doctor.consultation_fee,
        "is_active": doctor.is_active,
        "user_id": doctor.user_id,
    }


@router.get("/bookings", response_model=list[BookingOut])
def get_my_bookings(
    status: str | None = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_doctor),
):
    """Doctor o'ziga kelgan barcha bronlarni ko'radi"""
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        return []
    service = BookingService(db)
    return service.booking_repo.get_all_bookings(
        status=status, doctor_id=doctor.id, skip=skip, limit=limit
    )


@router.patch("/bookings/{id}/status", response_model=BookingOut)
def update_my_booking_status(
    id: int,
    data: BookingUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_doctor),
):
    """Doctor o'z qabulidagi bronning statusini o'zgartiradi"""
    # Verify this booking belongs to the doctor
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="No doctor profile linked")

    service = BookingService(db)
    booking = service.booking_repo.get(id)
    if not booking or booking.doctor_id != doctor.id:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Booking not found or not yours")

    return service.update_status(
        booking_id=id, new_status=data.status, reason=data.cancellation_reason
    )
