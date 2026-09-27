import os
import uuid
from datetime import time
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.api.deps import get_db
from app.core.security import create_access_token, hash_password
from app.database import Base
from app.database.models import (
    Doctor,
    DoctorSchedule,
    Service,
    User,
    UserRole,
)
from app.main import app

# Isolated SQLite database specifically for automated tests
TEST_DATABASE_URL = "sqlite:///./test_healthplus.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def init_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)
    test_db_path = os.path.abspath("./test_healthplus.db")
    if os.path.exists(test_db_path):
        try:
            os.remove(test_db_path)
        except OSError:
            pass


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session) -> User:
    email = f"user_{uuid.uuid4().hex[:6]}@example.com"
    user = User(
        email=email,
        full_name="Test Patient",
        phone="+998901112233",
        hashed_password=hash_password("password123"),
        role=UserRole.USER.value,
        is_active=True,
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
        is_active=True,
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
        icon="stethoscope",
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
        location="Clinic Room 101",
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
            slot_duration_minutes=30,
        )
        db_session.add(sched)
    db_session.commit()

    return doctor
