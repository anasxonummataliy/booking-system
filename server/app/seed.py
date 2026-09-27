from datetime import date, datetime, time, timedelta

from app.core.security import hash_password
from app.database import Base, SessionLocal, engine
from app.database.models import (
    Booking,
    BookingStatus,
    Doctor,
    DoctorSchedule,
    Service,
    User,
    UserRole,
)


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).filter(User.email == "alex@healthplus.com").first():
        print("Database already contains seed data. Skipping...")
        db.close()
        return

    print("Seeding database with HealthPlus data...")

    # 1. Create Users
    admin_user = User(
        email="admin@healthplus.com",
        full_name="Admin HealthPlus",
        phone="+998901234567",
        hashed_password=hash_password("admin123"),
        role=UserRole.ADMIN.value,
        is_active=True,
    )
    db.add(admin_user)

    alex_user = User(
        email="alex@healthplus.com",
        full_name="Alex Turner",
        phone="+998909876543",
        hashed_password=hash_password("password123"),
        role=UserRole.USER.value,
        is_active=True,
    )
    db.add(alex_user)

    # Extra patients
    patient_ali = User(
        email="ali@example.com",
        full_name="Ali Karimov",
        phone="+998931112233",
        hashed_password=hash_password("password123"),
        role=UserRole.USER.value,
    )
    patient_sevinch = User(
        email="sevinch@example.com",
        full_name="Sevinch Tursunova",
        phone="+998932223344",
        hashed_password=hash_password("password123"),
        role=UserRole.USER.value,
    )
    patient_behzod = User(
        email="behzod@example.com",
        full_name="Behzod Rahimov",
        phone="+998933334455",
        hashed_password=hash_password("password123"),
        role=UserRole.USER.value,
    )
    patient_malika = User(
        email="malika@example.com",
        full_name="Malika Sodiqova",
        phone="+998934445566",
        hashed_password=hash_password("password123"),
        role=UserRole.USER.value,
    )
    db.add_all([patient_ali, patient_sevinch, patient_behzod, patient_malika])
    db.commit()

    # 2. Create Services
    services_data = [
        {
            "name": "General Checkup",
            "description": (
                "General health checkup, vital signs, physical exam and initial consultation."
            ),
            "duration": 30,
            "price": 30.0,
            "icon": "stethoscope",
        },
        {
            "name": "Dermatology",
            "description": "Skin, hair and nail problems, mole mapping and cosmetic diagnostics.",
            "duration": 45,
            "price": 50.0,
            "icon": "droplet",
        },
        {
            "name": "Cardiology",
            "description": (
                "Heart health check, ECG interpretation, blood pressure, "
                "and cardiovascular consultation."
            ),
            "duration": 60,
            "price": 70.0,
            "icon": "heart",
        },
        {
            "name": "Pediatrics",
            "description": (
                "Child health, growth monitoring, developmental checks and vaccinations."
            ),
            "duration": 40,
            "price": 40.0,
            "icon": "baby",
        },
        {
            "name": "Gynecology",
            "description": "Women's reproductive health, prenatal checkups and consultations.",
            "duration": 45,
            "price": 60.0,
            "icon": "female",
        },
        {
            "name": "Orthopedics",
            "description": "Bone, joint, spine, and musculoskeletal injury consultations.",
            "duration": 60,
            "price": 80.0,
            "icon": "bone",
        },
    ]

    services_map = {}
    for s in services_data:
        svc = Service(**s)
        db.add(svc)
        db.flush()
        services_map[s["name"]] = svc

    db.commit()

    # 3. Create Doctors
    doctors_data = [
        {
            "full_name": "Dr. Sarah Johnson",
            "specialty": "General Practitioner",
            "service_id": services_map["General Checkup"].id,
            "bio": (
                "Dr. Sarah Johnson is a dedicated general practitioner with a focus on "
                "preventive care, lifestyle medicine, and overall patient wellness."
            ),
            "rating": 4.8,
            "reviews_count": 124,
            "experience_years": 8,
            "consultation_fee": 30.0,
            "avatar_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
            "education": "Tashkent Medical Academy, 2015",
            "languages": "English, Uzbek, Russian",
            "location": "City Medical Center, Tashkent",
        },
        {
            "full_name": "Dr. Michael Brown",
            "specialty": "Cardiologist",
            "service_id": services_map["Cardiology"].id,
            "bio": (
                "Senior cardiologist specializing in hypertension management, "
                "arrhythmia diagnosis, and comprehensive cardiovascular risk assessments."
            ),
            "rating": 4.9,
            "reviews_count": 182,
            "experience_years": 12,
            "consultation_fee": 70.0,
            "avatar_url": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
            "education": "Samarkand State Medical University, 2012",
            "languages": "English, Uzbek",
            "location": "Central Cardiology Institute, Tashkent",
        },
        {
            "full_name": "Dr. Emily Davis",
            "specialty": "Dermatologist",
            "service_id": services_map["Dermatology"].id,
            "bio": (
                "Board-certified dermatologist experienced in diagnosing acne, eczema, psoriasis, "
                "and performing dermoscopy for skin cancer screening."
            ),
            "rating": 4.7,
            "reviews_count": 95,
            "experience_years": 7,
            "consultation_fee": 50.0,
            "avatar_url": "https://images.unsplash.com/photo-1594824813633-46c596e12368?auto=format&fit=crop&q=80&w=300",
            "education": "Tashkent Pediatric Medical Institute, 2017",
            "languages": "English, Russian",
            "location": "Skin & Laser Center, Tashkent",
        },
        {
            "full_name": "Dr. James Wilson",
            "specialty": "Pediatrician",
            "service_id": services_map["Pediatrics"].id,
            "bio": (
                "Passionate pediatrician creating a friendly, reassuring environment for "
                "infants and children while treating acute childhood conditions."
            ),
            "rating": 4.8,
            "reviews_count": 140,
            "experience_years": 10,
            "consultation_fee": 40.0,
            "avatar_url": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300",
            "education": "Tashkent Medical Academy, 2014",
            "languages": "English, Uzbek, Russian",
            "location": "Children's Health Clinic, Tashkent",
        },
        {
            "full_name": "Dr. Lisa Anderson",
            "specialty": "Gynecologist",
            "service_id": services_map["Gynecology"].id,
            "bio": (
                "Compassionate women's health specialist with extensive background in "
                "obstetrics, reproductive endocrine care, and ultrasound screening."
            ),
            "rating": 4.9,
            "reviews_count": 160,
            "experience_years": 11,
            "consultation_fee": 60.0,
            "avatar_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
            "education": "Bukhara State Medical Institute, 2013",
            "languages": "English, Uzbek",
            "location": "Women's Wellness Wing, Tashkent",
        },
    ]

    doctors_map = {}
    for d in doctors_data:
        doc = Doctor(**d)
        db.add(doc)
        db.flush()
        doctors_map[d["full_name"]] = doc

        # Add Mon-Sat schedules for each doctor
        for day in range(6):  # Monday=0 to Saturday=5
            schedule = DoctorSchedule(
                doctor_id=doc.id,
                day_of_week=day,
                start_time=time(9, 0),
                end_time=time(17, 0),
                break_start=time(13, 0),
                break_end=time(14, 0),
                slot_duration_minutes=30,
                is_active=True,
            )
            db.add(schedule)

    db.commit()

    # 4. Create Initial Bookings (Matching screenshot)
    # Target dates
    today = date.today()
    upcoming_date = today + timedelta(days=2)
    past_date1 = today - timedelta(days=5)
    past_date2 = today - timedelta(days=12)
    past_date3 = today - timedelta(days=20)

    dr_sarah = doctors_map["Dr. Sarah Johnson"]
    dr_michael = doctors_map["Dr. Michael Brown"]
    dr_emily = doctors_map["Dr. Emily Davis"]
    dr_james = doctors_map["Dr. James Wilson"]

    bookings_data = [
        # Alex's upcoming booking
        Booking(
            booking_reference="HP-2025-4891",
            user_id=alex_user.id,
            doctor_id=dr_sarah.id,
            service_id=services_map["General Checkup"].id,
            start_time=datetime.combine(upcoming_date, time(10, 0)),
            end_time=datetime.combine(upcoming_date, time(10, 30)),
            status=BookingStatus.CONFIRMED.value,
            total_price=30.0,
            notes="Routine annual physical examination and blood pressure test.",
        ),
        # Alex's past completed booking
        Booking(
            booking_reference="HP-2025-3120",
            user_id=alex_user.id,
            doctor_id=dr_michael.id,
            service_id=services_map["Cardiology"].id,
            start_time=datetime.combine(past_date1, time(14, 30)),
            end_time=datetime.combine(past_date1, time(15, 30)),
            status=BookingStatus.COMPLETED.value,
            total_price=70.0,
            notes="ECG checkup and cardiology review.",
        ),
        # Alex's completed dermatology
        Booking(
            booking_reference="HP-2025-2415",
            user_id=alex_user.id,
            doctor_id=dr_emily.id,
            service_id=services_map["Dermatology"].id,
            start_time=datetime.combine(past_date2, time(11, 0)),
            end_time=datetime.combine(past_date2, time(11, 45)),
            status=BookingStatus.COMPLETED.value,
            total_price=50.0,
            notes="Skin allergy assessment.",
        ),
        # Alex's cancelled appointment
        Booking(
            booking_reference="HP-2025-1088",
            user_id=alex_user.id,
            doctor_id=dr_james.id,
            service_id=services_map["Pediatrics"].id,
            start_time=datetime.combine(past_date3, time(9, 30)),
            end_time=datetime.combine(past_date3, time(10, 10)),
            status=BookingStatus.CANCELLED.value,
            total_price=40.0,
            notes="Followup consultation",
            cancellation_reason="Rescheduled to another week",
        ),
        # Admin dashboard other patient bookings
        Booking(
            booking_reference="HP-2025-9011",
            user_id=patient_ali.id,
            doctor_id=dr_sarah.id,
            service_id=services_map["General Checkup"].id,
            start_time=datetime.combine(today + timedelta(days=1), time(10, 0)),
            end_time=datetime.combine(today + timedelta(days=1), time(10, 30)),
            status=BookingStatus.CONFIRMED.value,
            total_price=30.0,
        ),
        Booking(
            booking_reference="HP-2025-9012",
            user_id=patient_sevinch.id,
            doctor_id=dr_emily.id,
            service_id=services_map["Dermatology"].id,
            start_time=datetime.combine(today + timedelta(days=1), time(11, 30)),
            end_time=datetime.combine(today + timedelta(days=1), time(12, 15)),
            status=BookingStatus.PENDING.value,
            total_price=50.0,
        ),
        Booking(
            booking_reference="HP-2025-9013",
            user_id=patient_behzod.id,
            doctor_id=dr_michael.id,
            service_id=services_map["Cardiology"].id,
            start_time=datetime.combine(today + timedelta(days=2), time(15, 0)),
            end_time=datetime.combine(today + timedelta(days=2), time(16, 0)),
            status=BookingStatus.CONFIRMED.value,
            total_price=70.0,
        ),
        Booking(
            booking_reference="HP-2025-9014",
            user_id=patient_malika.id,
            doctor_id=dr_james.id,
            service_id=services_map["Pediatrics"].id,
            start_time=datetime.combine(past_date1, time(9, 0)),
            end_time=datetime.combine(past_date1, time(9, 40)),
            status=BookingStatus.COMPLETED.value,
            total_price=40.0,
        ),
    ]

    db.add_all(bookings_data)
    db.commit()
    print("Database successfully seeded!")
    db.close()


if __name__ == "__main__":
    seed_database()
