# 🏥 HealthPlus - Modern Doctor Appointment Booking System

> **A production-ready Doctor Appointment Booking System for healthcare & service businesses** built with **FastAPI (Clean Architecture & Repository Pattern)**, **PostgreSQL (Docker)**, **Flask-Admin Panel**, and **React (Vite)** with custom UI aesthetics matching the HealthPlus telemedicine specification.

---

## 📸 Overview & UI Preview
HealthPlus offers a complete patient and administrative booking experience:
1. **Interactive Landing & Doctor Search:** Filter by service, doctor specialty, and preferred date.
2. **Service Catalog:** View detailed consultation duration, pricing, and specialty categorizations.
3. **Doctor Availability & Slot Generation:** Real-time generation of 30-min time slots accounting for working hours, breaks, and existing bookings.
4. **Race-Condition-Free Booking Stepper:** 3-step checkout with instant conflict prevention.
5. **Patient Dashboard:** Upcoming appointments, real-time status tracking (`Confirmed`, `Pending`, `Cancelled`, `Completed`), and one-click cancellation.
6. **Dual Admin Panels:**
   - **React Clinic Dashboard:** Live KPI cards, 7-day bookings overview curve, and appointment state controls.
   - **Flask-Admin Panel (`/admin`):** Direct relational CRUD interface over SQLAlchemy models mounted seamlessly onto FastAPI via WSGI middleware.

---

## 🏗 System Architecture (Clean Architecture)

The backend follows **Clean Architecture** and **Domain-Driven Design (DDD)** principles to separate concerns into decoupled layers:

```
server/
├── app/
│   ├── core/                  # Infrastructure configurations
│   │   ├── config.py          # Environment settings (Pydantic Settings)
│   │   ├── database.py        # SQLAlchemy engine & session factory
│   │   └── security.py        # Bcrypt password hashing & JWT token handling
│   ├── domain/                # Enterprise Business Rules & Entities
│   │   └── models.py          # SQLAlchemy Models (User, Doctor, Service, Schedule, Booking)
│   ├── schemas/               # Data Transfer Objects (Pydantic v2 validation)
│   │   ├── user.py
│   │   ├── service.py
│   │   ├── doctor.py
│   │   ├── schedule.py
│   │   └── booking.py
│   ├── repositories/          # Data Access Layer (Repository Pattern)
│   │   ├── base.py            # Generic BaseRepository with CRUD abstractions
│   │   ├── user_repository.py
│   │   ├── service_repository.py
│   │   ├── doctor_repository.py
│   │   ├── schedule_repository.py
│   │   └── booking_repository.py  # Concurrency locking & slot overlap validation
│   ├── services/              # Application Business Logic
│   │   ├── auth_service.py    # Authentication, JWT issuance, password verification
│   │   ├── booking_service.py # Slot calculation, conflict prevention, cancellation rules
│   │   └── catalog_service.py # Services & doctors directory business rules
│   ├── api/                   # Presentation Layer (FastAPI Routers)
│   │   ├── deps.py            # Session injection & JWT role-based dependencies
│   │   ├── v1/
│   │   │   ├── auth.py        # /auth/register, /auth/login, /auth/me
│   │   │   ├── services.py    # /services catalog
│   │   │   ├── doctors.py     # /doctors and /doctors/{id}/slots
│   │   │   ├── bookings.py    # /bookings creation, cancellation, history
│   │   │   └── admin.py       # /admin/metrics & live clinic management
│   │   └── router.py          # Aggregated v1 router
│   ├── admin/                 # Flask-Admin Integration
│   │   └── flask_admin_app.py # ModelViews for Users, Doctors, Services, Schedules, Bookings
│   ├── seed.py                # Database seeder with realistic test data & demo accounts
│   └── main.py                # FastAPI ASGI entrypoint with mounted Flask WSGI app
└── tests/                     # Comprehensive Pytest Suite
    ├── conftest.py            # SQLite in-memory fixtures & mock client
    ├── test_auth.py           # Registration & JWT verification tests
    ├── test_services_doctors.py # Catalog & slot generation tests
    ├── test_bookings.py       # Creation, retrieval & cancellation tests
    └── test_race_condition.py # Concurrent double-booking prevention test
```

---

## ⚡ Concurrency & Race Conditions Handling

### "Ikki user bir xil vaqtda bir slotni booking qilsa nima bo'ladi?" (What happens if 2 users book the same slot simultaneously?)

When two users submit a reservation for Doctor $D$ at time $T$ at the exact same millisecond:
1. **Row-Level Transaction Lock (`SELECT ... FOR UPDATE`):**
   In `BookingRepository.create_booking_with_concurrency_lock`, the transaction acquires an exclusive row-level lock on the `Doctor` record in PostgreSQL:
   ```python
   # Locks the doctor row for the duration of the transaction
   self.db.query(Doctor).filter(Doctor.id == booking.doctor_id).with_for_update().first()
   ```
2. **Conflict Overlap Evaluation:**
   While holding the lock, the system evaluates:
   ```sql
   SELECT id FROM bookings 
   WHERE doctor_id = :doc_id 
     AND status != 'Cancelled' 
     AND start_time < :new_end 
     AND end_time > :new_start;
   ```
3. **Deterministic Outcome:**
   - **User A (first to acquire lock):** The check succeeds $\to$ appointment record is committed with status `Confirmed` $\to$ HTTP 200 OK.
   - **User B (queued on lock):** Once User A commits, User B's lock is released. User B's transaction immediately sees User A's confirmed booking overlapping the slot $\to$ transaction rolls back $\to$ raises `SlotAlreadyBookedException` $\to$ returns **HTTP 409 Conflict** with a clear message:
     > *"Selected slot (10:00 - 10:30) is no longer available. Another patient just booked it. Please choose another time."*
4. **Database Safety Constraint:**
   A composite index `(doctor_id, start_time)` ensures integrity at the database layer.

---

## 🛡 Handled Edge Cases

| Edge Case | Solution |
|-----------|----------|
| **Simultaneous booking of same slot** | Row-level locking (`with_for_update`) + transactional isolation + HTTP 409 Conflict response. |
| **Booking in the past** | Filtered out during available slot calculation (`start_time > now()`). |
| **Booking during doctor break hours** | Doctors have defined `break_start` and `break_end` (e.g. 13:00 - 14:00). Break slots are excluded from availability. |
| **Cancelling already completed visits** | `BookingService.cancel_booking` verifies status is not `Completed`; rejects invalid transitions with HTTP 400. |
| **Unauthorized booking cancellation** | Patients can only cancel their own bookings; administrators can manage all bookings. |
| **Variable service duration** | Slots are dynamically calculated using the specific service duration (30m, 45m, 60m). |

---

## 🎛 Dual Admin Panels: Flask-Admin & React Dashboard

### 1. Flask-Admin at `/admin`
FastAPI mounts a WSGI Flask-Admin app using `a2wsgi.WSGIMiddleware`:
```python
flask_admin_app = create_flask_admin_app()
app.mount("/admin", WSGIMiddleware(flask_admin_app))
```
- Direct relational database administration.
- Search, filter, edit, delete, and view details on `Users`, `Doctors`, `Services`, `Schedules`, and `Bookings`.
- Accessible at: **`http://localhost:8000/admin`**

### 2. Modern React Admin Dashboard
- Live clinic KPI metrics (Total Bookings, Confirmed, Pending, Cancelled, Revenue).
- 7-day visual appointments trend chart.
- Real-time booking approval/completion/cancellation table.
- Accessible directly within the React web application at the **Admin Portal** tab.

---

## 🚀 Quickstart Instructions

### Option 1: Docker (Recommended)
Make sure Docker Desktop is running, then execute:
```bash
docker compose up --build
```
- **React Frontend:** `http://localhost:3000`
- **FastAPI API & Swagger Docs:** `http://localhost:8000/docs`
- **Flask-Admin Panel:** `http://localhost:8000/admin`

---

### Option 2: Local Development Setup

#### Backend Setup:
```bash
cd server
uv sync # or: uv pip install -r requirements.txt
# Run the FastAPI server (starts on SQLite fallback or PostgreSQL depending on DATABASE_URL):
uv run uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🔑 Demo Accounts (Pre-seeded)

| Role | Email | Password | Details |
|------|-------|----------|---------|
| **Patient (Alex)** | `alex@healthplus.com` | `password123` | Patient from mockup with active & past appointments |
| **Clinic Administrator** | `admin@healthplus.com` | `admin123` | Full access to React Admin & Flask-Admin |
| **Doctor (Dr. Sarah Johnson)** | `sarah.johnson@healthplus.com` | `doctor123` | General Practitioner with pre-set schedules |

*(Note: The login dialog features 1-click quick login buttons for Alex and Admin to allow instant evaluation without typing!)*

---

## 🧪 Running Automated Tests

Run the complete test suite including the concurrent race condition test:
```bash
cd server
uv run pytest -v
```

All tests run in-memory with automatic schema setup and teardown.