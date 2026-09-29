import os
import sys
from datetime import date, datetime, time, timedelta

# Ensure server/ is in python path when running app/seed.py directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

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


def seed_database(force: bool = False):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded with new Uzbek doctors
    existing_uzbek_doctor = db.query(Doctor).filter(Doctor.full_name == "Dr. Alisher Usmonov").first()
    if existing_uzbek_doctor and not force:
        print("Database already contains Uzbek doctors seed data. Skipping...")
        db.close()
        return

    print("Seeding database with HealthPlus Uzbek doctors data...")

    # If force or upgrading from old data, remove existing bookings, schedules, and doctors
    if force or not existing_uzbek_doctor:
        db.query(Booking).delete()
        db.query(DoctorSchedule).delete()
        db.query(Doctor).delete()
        db.commit()

    # 1. Create or get Users
    admin_user = db.query(User).filter(User.email == "admin@healthplus.com").first()
    if not admin_user:
        admin_user = User(
            email="admin@healthplus.com",
            full_name="Admin HealthPlus",
            phone="+998901234567",
            hashed_password=hash_password("admin123"),
            role=UserRole.ADMIN.value,
            is_active=True,
        )
        db.add(admin_user)

    # Demo patient user
    anasxon_user = db.query(User).filter(User.email.in_(["anasxon@healthplus.com", "alex@healthplus.com"])).first()
    if not anasxon_user:
        anasxon_user = User(
            email="anasxon@healthplus.com",
            full_name="Anasxon Ummataliyev",
            phone="+998901234567",
            hashed_password=hash_password("password123"),
            role=UserRole.USER.value,
            is_active=True,
        )
        db.add(anasxon_user)

    # Doctor user account
    nodira_user = db.query(User).filter(User.email == "nodira.karimova@healthplus.com").first()
    if not nodira_user:
        nodira_user = User(
            email="nodira.karimova@healthplus.com",
            full_name="Dr. Nodira Karimova",
            phone="+998971234567",
            hashed_password=hash_password("doctor123"),
            role=UserRole.DOCTOR.value,
            is_active=True,
        )
        db.add(nodira_user)

    # Extra patients
    patient_ali = db.query(User).filter(User.email == "ali@example.com").first()
    if not patient_ali:
        patient_ali = User(
            email="ali@example.com",
            full_name="Ali Karimov",
            phone="+998931112233",
            hashed_password=hash_password("password123"),
            role=UserRole.USER.value,
        )
        db.add(patient_ali)

    patient_sevinch = db.query(User).filter(User.email == "sevinch@example.com").first()
    if not patient_sevinch:
        patient_sevinch = User(
            email="sevinch@example.com",
            full_name="Sevinch Tursunova",
            phone="+998932223344",
            hashed_password=hash_password("password123"),
            role=UserRole.USER.value,
        )
        db.add(patient_sevinch)

    patient_behzod = db.query(User).filter(User.email == "behzod@example.com").first()
    if not patient_behzod:
        patient_behzod = User(
            email="behzod@example.com",
            full_name="Behzod Rahimov",
            phone="+998933334455",
            hashed_password=hash_password("password123"),
            role=UserRole.USER.value,
        )
        db.add(patient_behzod)

    patient_malika = db.query(User).filter(User.email == "malika@example.com").first()
    if not patient_malika:
        patient_malika = User(
            email="malika@example.com",
            full_name="Malika Sodiqova",
            phone="+998934445566",
            hashed_password=hash_password("password123"),
            role=UserRole.USER.value,
        )
        db.add(patient_malika)

    db.commit()

    # 2. Create or fetch Services
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
        existing_svc = db.query(Service).filter(Service.name == s["name"]).first()
        if not existing_svc:
            existing_svc = Service(**s)
            db.add(existing_svc)
            db.flush()
        services_map[s["name"]] = existing_svc

    db.commit()

    # 3. Create 10 Authentic Uzbekistani Doctors
    doctors_data = [
        {
            "full_name": "Dr. Alisher Usmonov",
            "specialty": "Kardiolog",
            "service_id": services_map["Cardiology"].id,
            "bio": (
                "Toshkent Tibbiyot Akademiyasi professori, 15 yillik tajribaga ega yetakchi kardiolog. "
                "Gipertoniya, yurak ishemik kasalligi va aritmiyalarni zamonaviy xalqaro standartlar "
                "bo‘yicha tashxislash va davolash mutaxassisi."
            ),
            "rating": 4.9,
            "reviews_count": 215,
            "experience_years": 15,
            "consultation_fee": 70.0,
            "avatar_url": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
            "education": "Toshkent Tibbiyot Akademiyasi, 2009",
            "languages": "O'zbek, Rus, Ingliz",
            "location": "Respublika Kardiologiya Markazi, Toshkent",
        },
        {
            "full_name": "Dr. Nodira Karimova",
            "specialty": "Umumiy amaliyot shifokori",
            "service_id": services_map["General Checkup"].id,
            "bio": (
                "Oila shifokori va umumiy amaliyot terapevti. Butun tana a'zolari salomatligi monitoringi, "
                "profilaktik ko‘riklar va sog‘lom turmush tarzi bo‘yicha 10 yillik tajribali mutaxassis."
            ),
            "rating": 4.8,
            "reviews_count": 142,
            "experience_years": 10,
            "consultation_fee": 30.0,
            "avatar_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
            "education": "Toshkent Tibbiyot Akademiyasi, 2014",
            "languages": "O'zbek, Rus",
            "location": "HealthPlus City Clinic, Chilonzor tumani, Toshkent",
        },
        {
            "full_name": "Dr. Jasur Rahimov",
            "specialty": "Dermatolog",
            "service_id": services_map["Dermatology"].id,
            "bio": (
                "Teri, soch va tirnoq kasalliklarini davolash bo‘yicha yuqori toifali dermatolog. "
                "Dermatoskopik tahlillar, akne va ekzemani samarali kompleks davolash bo‘yicha mutaxassis."
            ),
            "rating": 4.9,
            "reviews_count": 165,
            "experience_years": 8,
            "consultation_fee": 50.0,
            "avatar_url": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
            "education": "Toshkent Pediatriya Tibbiyot Instituti, 2016",
            "languages": "O'zbek, Rus, Ingliz",
            "location": "Dermatologiya va Kosmetologiya Markazi, Toshkent",
        },
        {
            "full_name": "Dr. Shahnoza Umarova",
            "specialty": "Bolalar shifokori",
            "service_id": services_map["Pediatrics"].id,
            "bio": (
                "Bolalar salomatligi, chaqaloqlar rivojlanishi, immunizatsiya va mavsumiy "
                "yuqumli kasalliklarni aniqlash hamda yengil davolash bo‘yicha mehribon va malakali pediatr."
            ),
            "rating": 4.9,
            "reviews_count": 189,
            "experience_years": 12,
            "consultation_fee": 40.0,
            "avatar_url": "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=400",
            "education": "Toshkent Pediatriya Tibbiyot Instituti, 2012",
            "languages": "O'zbek, Rus",
            "location": "Bolalar Salomatligi Markazi, Yunusobod tumani, Toshkent",
        },
        {
            "full_name": "Dr. Dilnoza Ahmedova",
            "specialty": "Ginekolog",
            "service_id": services_map["Gynecology"].id,
            "bio": (
                "Ayollar salomatligi, reproduktiv tibbiyot, homiladorlikka tayyorgarlik va "
                "profilaktika bo‘yicha 14 yillik amaliy tajribaga ega oliy toifali akusher-ginekolog."
            ),
            "rating": 4.8,
            "reviews_count": 198,
            "experience_years": 14,
            "consultation_fee": 60.0,
            "avatar_url": "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400",
            "education": "Samarqand Davlat Tibbiyot Universiteti, 2010",
            "languages": "O'zbek, Rus, Ingliz",
            "location": "Ayollar Salomatligi Markazi, Mirzo Ulug‘bek tumani, Toshkent",
        },
        {
            "full_name": "Dr. Bekzod Rustamov",
            "specialty": "Ortoped-Travmatolog",
            "service_id": services_map["Orthopedics"].id,
            "bio": (
                "Suyak, bo‘g‘im, umurtqa xastaliklari hamda sport jarohatlaridan keyingi "
                "reabilitatsiya bo‘yicha tajribali ortoped-travmatolog xirurg."
            ),
            "rating": 4.7,
            "reviews_count": 114,
            "experience_years": 9,
            "consultation_fee": 80.0,
            "avatar_url": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
            "education": "Andijon Davlat Tibbiyot Instituti, 2015",
            "languages": "O'zbek, Rus",
            "location": "Travmatologiya va Ortopediya Markazi, Toshkent",
        },
        {
            "full_name": "Dr. Feruza Mahmudova",
            "specialty": "Umumiy amaliyot shifokori",
            "service_id": services_map["General Checkup"].id,
            "bio": (
                "Terapevtik kasalliklar, qon bosimi va metabolik o‘zgarishlarni profilaktika qilish "
                "hamda zamonaviy tekshiruvlar asosida sog‘lomlashtirish bo‘yicha mutaxassis."
            ),
            "rating": 4.8,
            "reviews_count": 126,
            "experience_years": 7,
            "consultation_fee": 35.0,
            "avatar_url": "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400",
            "education": "Buxoro Davlat Tibbiyot Instituti, 2017",
            "languages": "O'zbek, Rus, Ingliz",
            "location": "Medion Family Clinic, Shayxontohur tumani, Toshkent",
        },
        {
            "full_name": "Dr. Jamshid To'rayev",
            "specialty": "Kardiolog",
            "service_id": services_map["Cardiology"].id,
            "bio": (
                "EKG, ultratovushli kardiografiya va yurak aritmiyalari bo‘yicha ixtisoslashgan kardiolog. "
                "Yevropa Kardiologlar Jamiyati (ESC) xalqaro sertifikati sohibi."
            ),
            "rating": 4.9,
            "reviews_count": 172,
            "experience_years": 11,
            "consultation_fee": 65.0,
            "avatar_url": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400",
            "education": "Toshkent Tibbiyot Akademiyasi, 2013",
            "languages": "O'zbek, Rus, Ingliz",
            "location": "Central Cardio Institute, Yakkasaroy tumani, Toshkent",
        },
        {
            "full_name": "Dr. Kamola Zokirova",
            "specialty": "Dermatolog-Kosmetolog",
            "service_id": services_map["Dermatology"].id,
            "bio": (
                "Estetik va tibbiy dermatologiya, teri muammolari, toshmalar va yoshga doir "
                "o‘zgarishlarni xavfsiz davolash bo‘yicha zamonaviy dermatolog."
            ),
            "rating": 4.8,
            "reviews_count": 95,
            "experience_years": 6,
            "consultation_fee": 45.0,
            "avatar_url": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400",
            "education": "Toshkent Tibbiyot Akademiyasi, 2018",
            "languages": "O'zbek, Rus",
            "location": "Skin Care Aesthetics, Mirobod tumani, Toshkent",
        },
        {
            "full_name": "Dr. Otabek Sobirov",
            "specialty": "Bolalar shifokori",
            "service_id": services_map["Pediatrics"].id,
            "bio": (
                "Bolalar infeksion kasalliklari, nafas yo‘llari allergik reaksiyalari va bolalar "
                "immunitetini mustahkamlash bo‘yicha 13 yillik tajribali pediatr."
            ),
            "rating": 4.9,
            "reviews_count": 204,
            "experience_years": 13,
            "consultation_fee": 40.0,
            "avatar_url": "https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&q=80&w=400",
            "education": "Toshkent Pediatriya Tibbiyot Instituti, 2011",
            "languages": "O'zbek, Rus",
            "location": "Pediatriya Ilmiy Markazi, Olmazor tumani, Toshkent",
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

    # Link doctor user accounts to their Doctor records
    if nodira_user and "Dr. Nodira Karimova" in doctors_map:
        doctors_map["Dr. Nodira Karimova"].user_id = nodira_user.id
        db.commit()

    # 4. Create Initial Demo Bookings with new doctors
    today = date.today()
    upcoming_date = today + timedelta(days=2)
    past_date1 = today - timedelta(days=5)
    past_date2 = today - timedelta(days=12)
    past_date3 = today - timedelta(days=20)

    dr_nodira = doctors_map["Dr. Nodira Karimova"]
    dr_alisher = doctors_map["Dr. Alisher Usmonov"]
    dr_jasur = doctors_map["Dr. Jasur Rahimov"]
    dr_shahnoza = doctors_map["Dr. Shahnoza Umarova"]

    bookings_data = [
        # Anasxon's upcoming booking
        Booking(
            booking_reference="HP-2025-4891",
            user_id=anasxon_user.id,
            doctor_id=dr_nodira.id,
            service_id=services_map["General Checkup"].id,
            start_time=datetime.combine(upcoming_date, time(10, 0)),
            end_time=datetime.combine(upcoming_date, time(10, 30)),
            status=BookingStatus.CONFIRMED.value,
            total_price=30.0,
            notes="Muntazam yillik tibbiy ko'rik va qon bosimi nazorati.",
        ),
        # Anasxon's past completed booking
        Booking(
            booking_reference="HP-2025-3120",
            user_id=anasxon_user.id,
            doctor_id=dr_alisher.id,
            service_id=services_map["Cardiology"].id,
            start_time=datetime.combine(past_date1, time(14, 30)),
            end_time=datetime.combine(past_date1, time(15, 30)),
            status=BookingStatus.COMPLETED.value,
            total_price=70.0,
            notes="EKG tahlili va kardiologiya konsultatsiyasi.",
        ),
        # Anasxon's completed dermatology
        Booking(
            booking_reference="HP-2025-2415",
            user_id=anasxon_user.id,
            doctor_id=dr_jasur.id,
            service_id=services_map["Dermatology"].id,
            start_time=datetime.combine(past_date2, time(11, 0)),
            end_time=datetime.combine(past_date2, time(11, 45)),
            status=BookingStatus.COMPLETED.value,
            total_price=50.0,
            notes="Teri allergiyasi va dermatoskopiya tekshiruvi.",
        ),
        # Anasxon's cancelled appointment
        Booking(
            booking_reference="HP-2025-1088",
            user_id=anasxon_user.id,
            doctor_id=dr_shahnoza.id,
            service_id=services_map["Pediatrics"].id,
            start_time=datetime.combine(past_date3, time(9, 30)),
            end_time=datetime.combine(past_date3, time(10, 10)),
            status=BookingStatus.CANCELLED.value,
            total_price=40.0,
            notes="Qayta ko'rik konsultatsiyasi",
            cancellation_reason="Boshqa haftaga ko'chirildi",
        ),
        # Admin dashboard other patient bookings
        Booking(
            booking_reference="HP-2025-9011",
            user_id=patient_ali.id,
            doctor_id=dr_nodira.id,
            service_id=services_map["General Checkup"].id,
            start_time=datetime.combine(today + timedelta(days=1), time(10, 0)),
            end_time=datetime.combine(today + timedelta(days=1), time(10, 30)),
            status=BookingStatus.CONFIRMED.value,
            total_price=30.0,
        ),
        Booking(
            booking_reference="HP-2025-9012",
            user_id=patient_sevinch.id,
            doctor_id=dr_jasur.id,
            service_id=services_map["Dermatology"].id,
            start_time=datetime.combine(today + timedelta(days=1), time(11, 30)),
            end_time=datetime.combine(today + timedelta(days=1), time(12, 15)),
            status=BookingStatus.PENDING.value,
            total_price=50.0,
        ),
        Booking(
            booking_reference="HP-2025-9013",
            user_id=patient_behzod.id,
            doctor_id=dr_alisher.id,
            service_id=services_map["Cardiology"].id,
            start_time=datetime.combine(today + timedelta(days=2), time(15, 0)),
            end_time=datetime.combine(today + timedelta(days=2), time(16, 0)),
            status=BookingStatus.CONFIRMED.value,
            total_price=70.0,
        ),
        Booking(
            booking_reference="HP-2025-9014",
            user_id=patient_malika.id,
            doctor_id=dr_shahnoza.id,
            service_id=services_map["Pediatrics"].id,
            start_time=datetime.combine(past_date1, time(9, 0)),
            end_time=datetime.combine(past_date1, time(9, 40)),
            status=BookingStatus.COMPLETED.value,
            total_price=40.0,
        ),
    ]

    db.add_all(bookings_data)
    db.commit()
    print("Database successfully seeded with 10 Uzbekistani doctors!")
    db.close()


if __name__ == "__main__":
    seed_database(force=True)
