# 🏥 HealthPlus - Zamonaviy Shifokor Qabuliga Yozilish Tizimi

> **Tibbiyot markazlari, klinikalar va xizmat ko‘rsatish sohalari uchun ishlab chiqarishga tayyor (production-ready) shifokor qabuliga yozilish tizimi.**  
> Loyiha **FastAPI (Clean Architecture & Repository Pattern)**, **SQLite (Asosiy ma'lumotlar bazasi)**, **Maxsus In-App React Admin Dashboard** hamda zamonaviy telemeditsina dizayniga ega **React (Vite)** texnologiyalarida yaratilgan.

---

## 📸 Loyiha Haqida va Asosiy Imkoniyatlar

HealthPlus bemorlar va klinika ma'muriyati uchun to‘liq qulaylik yaratuvchi zamonaviy ekotizimdir:

1. **Interaktiv Bosh Sahifa va Shifokorlarni Qidirish:** Shifokor mutaxassisligi, xizmat turi va kerakli sana bo‘yicha tezkor qidiruv hamda filtrlar.
2. **Tibbiy Xizmatlar Katalogi:** Har bir xizmat narxi, qabul davomiyligi (30, 45, 60 daqiqa) va yo‘nalishlari bo‘yicha batafsil ma'lumot.
3. **Ish Jadvali va Bo‘sh Vaqtlar (Slots) Generatsiyasi:** Shifokorning haftalik ish jadvali, tanaffus vaqtlari (Break time) va mavjud band vaqtlarini inobatga olgan holda real vaqt rejimida bo‘sh vaqtlarni shakllantirish.
4. **Poyga Holatlaridan (Race Condition) Himoyalangan 3 Bosqichli Bron:** Bir nechta foydalanuvchi bir vaqtda bitta vaqtni tanlaganda to‘qnashuvlarni oldini oluvchi bron tizimi.
5. **Bemor Shaxsiy Kabineti:** Kelgusi qabullar, o‘tgan ko‘riklar tarixi, real vaqt holati (`Tasdiqlangan`, `Kutilmoqda`, `Bekor qilingan`, `Yakunlangan`) va 1 ta tugma orqali bekor qilish imkoniyati.
6. **Maxsus React Admin Dashboard:** 
   - Jonli klinika KPI ko‘rsatkichlari (Umumiy tushum, jami qabullar, kutilayotgan ko‘riklar, faol shifokorlar va xizmatlar soni).
   - 7 kunlik qabullar statistikasi va tahliliy grafiklar.
   - Qabullarni bir martalik bosish orqali tasdiqlash, yakunlash yoki bekor qilish.
   - Xizmatlar, Shifokorlar profillari va Haftalik ish jadvallari ustida to‘liq **CRUD** (yaratish, tahrirlash, o‘chirish) amallari.
7. **Ko‘p Tillilik (i18n):** Butun platforma bo‘ylab O‘zbek (🇺🇿 UZ) va Ingliz (🇬🇧 EN) tillari o‘rtasida bir zumda almashtirish.

---

## 🏗 Tizim Arxitekturasi (Clean Architecture & DDD)

Backend qismi **Clean Architecture** va **Domain-Driven Design (DDD)** qoidalariga asoslangan holda modulli va kengaytiriluvchan qatlamlarga ajratilgan:

```
server/
├── app/
│   ├── core/                  # Infratuzilma va umumiy sozlamalar
│   │   ├── config.py          # Muhit o'zgaruvchilari (Pydantic Settings)
│   │   ├── database.py        # SQLAlchemy dvigateli va sessiyalar fabrikasi
│   │   └── security.py        # Parollarni xeshirlash (Bcrypt) va JWT tokenlar
│   ├── database/              # Ma'lumotlar bazasi modellari
│   │   ├── models/            # SQLAlchemy modellar (User, Doctor, Service, Schedule, Booking)
│   │   └── __init__.py
│   ├── schemas/               # Ma'lumotlarni tekshirish va uzatish (Pydantic v2 DTO)
│   │   ├── user.py
│   │   ├── service.py
│   │   ├── doctor.py
│   │   ├── schedule.py
│   │   └── booking.py
│   ├── repositories/          # Ma'lumotlarga kirish qatlami (Repository Pattern)
│   │   ├── base.py            # Umumiy CRUD abstraksiyaga ega BaseRepository
│   │   ├── user_repository.py
│   │   ├── service_repository.py
│   │   ├── doctor_repository.py
│   │   ├── schedule_repository.py
│   │   └── booking_repository.py  # Tranzaksiyaviy qulflash va to'qnashuvlarni tekshirish
│   ├── services/              # Biznes mantiq qatlami (Application Logic)
│   │   ├── auth_service.py    # Autentifikatsiya, JWT va xavfsizlik qoidalari
│   │   ├── booking_service.py # Bo'sh slotlarni hisoblash, bekor qilish qoidalari
│   │   └── catalog_service.py # Shifokorlar va xizmatlar katalogi boshqaruvi
│   ├── api/                   # Taqdimot qatlami (FastAPI Marshrutlari)
│   │   ├── deps.py            # Sessiyalar va JWT foydalanuvchi huquqlari inyeksiyasi
│   │   ├── v1/
│   │   │   ├── auth.py        # /auth/register, /auth/login, /auth/me
│   │   │   ├── services.py    # Xizmatlar ro'yxati va filtrlash
│   │   │   ├── doctors.py     # Shifokorlar va /doctors/{id}/slots
│   │   │   ├── bookings.py    # Bron qilish, bekor qilish va qabullar tarixi
│   │   │   └── admin.py       # Admin KPI metrikalari va boshqaruv API-lari
│   │   └── router.py          # Barcha v1 yo'nalishlarini birlashtiruvchi router
│   ├── seed.py                # O'zbekistonlik shifokorlar va sinov ma'lumotlari generatori
│   └── main.py                # FastAPI ASGI asosiy kirish nuqtasi
└── tests/                     # To'liq avtomatlashtirilgan Pytest to'plami
    ├── conftest.py            # Xotirada ishlovchi SQLite bazasi va mock-mijoz
    ├── test_auth.py           # Ro'yxatdan o'tish va JWT token testlari
    ├── test_services_doctors.py # Katalog va slot generatsiyasi testlari
    ├── test_bookings.py       # Bron yaratish, ko'rish va bekor qilish testlari
    └── test_race_condition.py # Bir vaqtda tushgan parallel so'rovlar (Race condition) testi
```

---

## ⚡ Parallel So‘rovlar va Poyga Holatlari (Race Condition) Qanday Hal Qilingan?

### ❓ "Ikki foydalanuvchi bir vaqtda bitta slotni bron qilsa nima yuz beradi?"

Agar ikki bemor bir millisekundda bitta shifokorning aynan bitta vaqtini band qilishga harakat qilsa:

1. **Qator Darajasidagi Tranzaksiyaviy Qulf (`SELECT ... FOR UPDATE`):**
   `BookingRepository.create_booking_with_concurrency_lock` funksiyasida tranzaksiya ochilganda, shifokor yozuvi bo‘yicha eksklyuziv qulflash o‘rnatiladi:
   ```python
   # Shifokor yozuvini tranzaksiya yakuniga qadar bloklaydi
   self.db.query(Doctor).filter(Doctor.id == booking.doctor_id).with_for_update().first()
   ```

2. **To‘qnashuvlarni Tekshirish (Overlap Evaluation):**
   Qulf ushlab turilgan vaqtda baza quyidagi so‘rovni amalga oshiradi:
   ```sql
   SELECT id FROM bookings 
   WHERE doctor_id = :doc_id 
     AND status != 'Cancelled' 
     AND start_time < :new_end 
     AND end_time > :new_start;
   ```

3. **Aniq Natija:**
   - **Birinchi foydalanuvchi:** Tekshiruvdan o‘tadi $\to$ bron `Confirmed` maqomida bazaga yoziladi $\to$ **HTTP 200 OK**.
   - **Ikkinchi foydalanuvchi:** Birinchi tranzaksiya tugagandan so‘ng navbati keladi $\to$ tizim ushbu vaqt allaqachon band qilinganini ko‘radi $\to$ tranzaksiya bekor qilinadi (`rollback`) $\to$ **HTTP 409 Conflict** xatoligi qaytariladi:
     > *"Tanlangan vaqt (10:00 - 10:30) band qilindi. Boshqa bemor hozirgina ushbu vaqtni band qildi. Iltimos, boshqa vaqtni tanlang."*

4. **Ma'lumotlar Bazasi Darajasidagi Indekslar:**
   Kombinatsiyalangan `(doctor_id, start_time)` indeksi baza darajasida ham yaxlitlikni kafolatlaydi.

---

## 🛡 Ko‘zda Tutilgan Chekka Holatlar (Edge Cases)

| Chekka Holat | Tizimdagi Yechimi |
|---|---|
| **Bir xil vaqtni bir nechta kishi bron qilishi** | Qator darajasidagi qulflash (`with_for_update`), tranzaksiya izolyatsiyasi va HTTP 409 javobi. |
| **O‘tgan vaqtga bron qilish** | Bo‘sh vaqtlarni hisoblashda o‘tgan vaqtlar avtomatik filtrlanadi (`start_time > now()`). |
| **Shifokorning tushlik/dam olish vaqtlari** | Har bir shifokor uchun `break_start` va `break_end` belgilangan; ushbu oraliqdagi vaqtlar ro‘yxatga kiritilmaydi. |
| **Yakunlangan qabulni bekor qilishga urinish** | `BookingService` qabul holati `Completed` ekanligini tekshiradi va HTTP 400 xatosi bilan taqiqlaydi. |
| **Begona bronni bekor qilishga urinish** | Oddiy bemor faqat o‘ziga tegishli bronlarni bekor qila oladi; barcha qabullarni faqat admin boshqara oladi. |
| **Xizmat davomiyligining har xilligi** | Har bir xizmat davomiyligi (30 daqiqa, 45 daqiqa, 1 soat) bo‘yicha slotlar dinamik hisoblab chiqariladi. |

---

## 🎛 Maxsus In-App React Admin Dashboard

Tizimda barcha boshqaruv ishlari alohida qulay va zamonaviy **React Admin Paneli** orqali amalga oshiriladi:

- **Boshqaruv Paneli (Overview):** Jami daromad, tasdiqlangan, kutilayotgan va bekor qilingan qabullar, so‘nggi yozilishlar ro‘yxati.
- **Qabullar Bo‘limi (Appointments):** Maqomlar bo‘yicha tezkor saralash (`Barchasi`, `Kutilmoqda`, `Tasdiqlangan`, `Yakunlangan`, `Bekor qilingan`), qabullarni bir martalik bosish orqali boshqarish.
- **Tibbiy Xizmatlar Bo‘limi (Services):** Yangi xizmat qo‘shish, narx va davomiylikni tahrirlash, xavfsiz o‘chirish (agar band qilingan bo‘lsa, faolsizlantiriladi).
- **Shifokorlar Bo‘limi (Doctors & Staff):** Shifokorlar profili, mutaxassisliklari, qabul narxi va biografiyasini boshqarish.
- **Ish Jadvallari Bo‘limi (Work Schedules):** Har bir shifokor uchun haftaning kunlari bo‘yicha ish boshlanishi, tugashi, tushlik vaqti va qabul oraliqlarini belgilash.

---

## 🚀 Loyihani Ishga Tushirish

### 1-usul: Docker Compose Orqali (Tavsiya etiladi)

Docker Desktop ishga tushirilganidan so‘ng quyidagi buyruqni bering:
```bash
docker compose up --build
```
- **React Frontend:** `http://localhost:3000`
- **FastAPI Backend & Swagger Hujjatlari:** `http://localhost:8000/docs`

---

### 2-usul: Mahalliy Rivojlantirish (Local Development)

#### Backendni Ishga Tushirish:
```bash
cd server

# Kerakli kutubxonalarni o'rnatish:
uv sync   # yoki: pip install -r requirements.txt

# Ma'lumotlar bazasi migratsiyalarini qo'llash:
uv run alembic upgrade head

# FastAPI serverini ishga tushirish:
uv run uvicorn app.main:app --reload --port 8000
```
*Backend manzili: `http://localhost:8000` (API Swagger: `http://localhost:8000/docs`)*

#### Frontendni Ishga Tushirish:
```bash
cd frontend

# Kutubxonalarni o'rnatish:
npm install

# Vite ishlab chiquvchi serverini ishga tushirish:
npm run dev
```
Brauzerda oching: **`http://localhost:5173`**

---

## 🔄 Alembic Ma'lumotlar Bazasi Migratsiyalari

Bazadagi o‘zgarishlar versiyalar nazorati ostida Alembic orqali boshqariladi:
```bash
cd server

# Oxirgi migratsiyalarni bazaga qo'llash:
uv run alembic upgrade head

# Modellar o'zgarganda yangi migratsiya yaratish:
uv run alembic revision --autogenerate -m "yangi_ozgarish_tavsifi"

# Joriy migratsiya holatini ko'rish:
uv run alembic current

# 1 qadam orqaga qaytarish:
uv run alembic downgrade -1
```

---

## 🔑 Tayyor Demo Hisoblar (Seed Data)

Tizim dastlabki sinov uchun real tibbiy ma'lumotlar va shifokorlar bilan boyitilgan:

| Rol | Elektron Pochta | Parol | Tavsif |
|---|---|---|---|
| **Bemor (Anasxon)** | `anasxon@healthplus.com` | `password123` | Faol va o‘tgan qabullarga ega namunaviy bemor |
| **Klinika Administratori** | `admin@healthplus.com` | `admin123` | Barcha qabullar, shifokorlar va xizmatlarni boshqarish |
| **Shifokor (Dr. Nodira Karimova)** | `nodira.karimova@healthplus.com` | `doctor123` | Oliy toifali terapevt, tayyor ish jadvaliga ega shifokor |

*(Eslatma: Saytning kirish oynasida qulaylik uchun 1 ta bosish orqali hisoblarga tezkor kirish tugmalari mavjud!)*

---

## 🧪 Avtomatlashtirilgan Testlar

To‘liq sinov to‘plamini, jumladan parallel so‘rovlar (race condition) testini ishga tushirish:
```bash
cd server
PYTHONPATH=. uv run pytest -v
```

Barcha testlar in-memory rejimida ishlaydi va avtomatik ravishda toza holatda yakunlanadi.