from datetime import datetime, date, time, timedelta


def test_create_and_get_booking(client, test_user_token, test_doctor, test_service):
    target_dt = datetime.combine(date.today() + timedelta(days=30), time(10, 0))
    payload = {
        "doctor_id": test_doctor.id,
        "service_id": test_service.id,
        "start_time": target_dt.isoformat(),
        "notes": "Testing routine appointment"
    }

    response = client.post(
        "/api/v1/bookings",
        json=payload,
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    if response.status_code != 200:
        print("FAIL DETAIL:", response.json())
    assert response.status_code == 200
    booking = response.json()
    assert booking["doctor_id"] == test_doctor.id
    assert booking["status"] == "Pending"
    assert booking["booking_reference"].startswith("HP-")

    # Verify in my appointments
    my_resp = client.get(
        "/api/v1/bookings/my",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert my_resp.status_code == 200
    my_bookings = my_resp.json()
    assert any(b["id"] == booking["id"] for b in my_bookings)


def test_cancel_booking(client, test_user_token, test_doctor, test_service):
    target_dt = datetime.combine(date.today() + timedelta(days=31), time(11, 0))
    payload = {
        "doctor_id": test_doctor.id,
        "service_id": test_service.id,
        "start_time": target_dt.isoformat(),
    }
    create_resp = client.post(
        "/api/v1/bookings",
        json=payload,
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    booking_id = create_resp.json()["id"]

    # Cancel
    cancel_resp = client.post(
        f"/api/v1/bookings/{booking_id}/cancel",
        json={"reason": "Schedule conflict"},
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["status"] == "Cancelled"
    assert cancel_resp.json()["cancellation_reason"] == "Schedule conflict"


def test_auto_expire_past_pending_booking(client, db_session, test_user, test_user_token, test_doctor, test_service):
    from app.database.models import Booking, BookingStatus

    past_time = datetime.now() - timedelta(days=2)
    past_booking = Booking(
        booking_reference="HP-TEST-EXPIRED",
        user_id=test_user.id,
        doctor_id=test_doctor.id,
        service_id=test_service.id,
        start_time=past_time,
        end_time=past_time + timedelta(minutes=30),
        status=BookingStatus.PENDING.value,
        total_price=50.0,
    )
    db_session.add(past_booking)
    db_session.commit()

    # When querying user bookings, the expired pending booking should auto-cancel
    res = client.get(
        "/api/v1/bookings/my",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert res.status_code == 200
    my_bookings = res.json()
    expired = next((b for b in my_bookings if b["booking_reference"] == "HP-TEST-EXPIRED"), None)
    assert expired is not None
    assert expired["status"] == "Cancelled"
    assert "Muddati o'tgan" in expired["cancellation_reason"]

