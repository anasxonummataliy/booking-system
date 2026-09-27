import pytest
import httpx
from datetime import datetime, date, time, timedelta
from app.core.security import create_access_token, hash_password
from app.database.models import User, UserRole, Booking
from app.main import app


@pytest.mark.asyncio
async def test_concurrent_double_booking_prevention(client, db_session, test_doctor, test_service):
    """
    Edge Case: Two users attempt to book the exact same time slot at the exact same moment.
    Expected outcome:
      - Exactly one booking succeeds (HTTP 200).
      - The competing concurrent attempt is blocked with HTTP 409 Conflict.
      - Database integrity is maintained with no overlapping appointments.
    """
    import uuid
    user_a = User(
        email=f"patient_a_{uuid.uuid4().hex[:6]}@example.com",
        full_name="Patient A",
        hashed_password=hash_password("passA"),
        role=UserRole.USER.value
    )
    user_b = User(
        email=f"patient_b_{uuid.uuid4().hex[:6]}@example.com",
        full_name="Patient B",
        hashed_password=hash_password("passB"),
        role=UserRole.USER.value
    )
    db_session.add_all([user_a, user_b])
    db_session.commit()
    db_session.refresh(user_a)
    db_session.refresh(user_b)

    token_a = create_access_token(subject=str(user_a.id))
    token_b = create_access_token(subject=str(user_b.id))

    # Unique future slot: 45 days from now at 14:00
    target_slot = datetime.combine(date.today() + timedelta(days=45), time(14, 0))
    payload = {
        "doctor_id": test_doctor.id,
        "service_id": test_service.id,
        "start_time": target_slot.isoformat(),
        "notes": "Testing race condition"
    }

    # Execute requests with httpx AsyncClient
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        req_a = ac.post("/api/v1/bookings", json=payload, headers={"Authorization": f"Bearer {token_a}"})
        req_b = ac.post("/api/v1/bookings", json=payload, headers={"Authorization": f"Bearer {token_b}"})
        import asyncio
        res_a, res_b = await asyncio.gather(req_a, req_b)

    status_codes = [res_a.status_code, res_b.status_code]

    # Verification:
    # 1. Exactly one must succeed with 200
    assert 200 in status_codes, f"Expected one 200 OK, got: {status_codes}"
    # 2. The other attempt must fail with 409 Conflict
    assert 409 in status_codes, f"Expected one 409 Conflict, got: {status_codes}"

    # 3. Check message
    conflict_resp = res_a if res_a.status_code == 409 else res_b
    detail_lower = conflict_resp.json()["detail"].lower()
    assert "booked" in detail_lower or "conflict" in detail_lower or "available" in detail_lower

    # 4. Check DB records count for this slot using db_session
    slot_bookings = db_session.query(Booking).filter(
        Booking.doctor_id == test_doctor.id,
        Booking.start_time == target_slot,
        Booking.status != "Cancelled"
    ).all()
    assert len(slot_bookings) == 1, f"There should be exactly one active booking in the DB, not {len(slot_bookings)}!"

