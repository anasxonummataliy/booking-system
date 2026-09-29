from fastapi import APIRouter

from app.api.v1 import admin, auth, bookings, doctor_portal, doctors, services

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(services.router)
api_router.include_router(doctors.router)
api_router.include_router(bookings.router)
api_router.include_router(admin.router)
api_router.include_router(doctor_portal.router)
