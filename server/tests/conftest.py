import os
import uuid
import pytest
from datetime import datetime, time, timedelta, timezone, date
from fastapi.testclient import TestClient

from app.database import SessionLocal, Base, engine
from app.core.security import hash_password, create_access_token
from app.database.models import User, Service, Doctor, DoctorSchedule, Booking, BookingStatus, UserRole
from app.main import app


@pytest.fixture(scope="session", autouse=True)
def init_db():
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def test_user(db_session) -> User:
    email = f"user_{uuid.uuid4().hex[:6]}@example.com"
    user = User(
        email=email,
        full_name="Test Patient",
        phone="+998901112233",
        hashed_password=hash_password("password123"),
        role=UserRole.USER.value,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_user_token(test_user) -> str:
    return create_access_token(subject=str(test_user.id))


@pytest.fixture
def test_admin_user(db_session) -> User:
    email = f"admin_{uuid.uuid4().hex[:6]}@example.com"
    admin = User(
        email=email,
        full_name="Test Admin",
        phone="+998909998877",
        hashed_password=hash_password("admin123"),
        role=UserRole.ADMIN.value,
        is_active=True
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


@pytest.fixture
def test_admin_token(test_admin_user) -> str:
    return create_access_token(subject=str(test_admin_user.id))


@pytest.fixture
def test_service(db_session) -> Service:
    name = f"Service {uuid.uuid4().hex[:6]}"
    service = Service(
        name=name,
        description="Comprehensive physical exam and health check.",
        duration=30,
        price=30.0,
        icon="stethoscope"
    )
    db_session.add(service)
    db_session.commit()
    db_session.refresh(service)
    return service


@pytest.fixture
def test_doctor(db_session, test_service) -> Doctor:
    name = f"Dr. Specialist {uuid.uuid4().hex[:6]}"
    doctor = Doctor(
        full_name=name,
        specialty="General Practitioner",
        service_id=test_service.id,
        bio="Test specialist bio.",
        rating=4.9,
        reviews_count=50,
        experience_years=10,
        consultation_fee=30.0,
        avatar_url="https://images.unsplash.com/photo-1559839734-2b71ea197ec2",
        education="Test Medical University",
        languages="English, Uzbek",
        location="Clinic Room 101"
    )
    db_session.add(doctor)
    db_session.commit()
    db_session.refresh(doctor)

    for day in range(7):
        sched = DoctorSchedule(
            doctor_id=doctor.id,
            day_of_week=day,
            start_time=time(9, 0),
            end_time=time(17, 0),
            break_start=time(13, 0),
            break_end=time(14, 0),
            slot_duration_minutes=30
        )
        db_session.add(sched)
    db_session.commit()

    return doctor
