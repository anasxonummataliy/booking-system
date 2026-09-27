from fastapi import APIRouter
from app.api.v1 import auth, services, doctors, bookings, admin

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(services.router)
api_router.include_router(doctors.router)
api_router.include_router(bookings.router)
api_router.include_router(admin.router)
