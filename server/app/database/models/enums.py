from enum import StrEnum


class UserRole(StrEnum):
    USER = "user"
    DOCTOR = "doctor"
    ADMIN = "admin"


class BookingStatus(StrEnum):
    PENDING = "Pending"
    CONFIRMED = "Confirmed"
    CANCELLED = "Cancelled"
    COMPLETED = "Completed"
