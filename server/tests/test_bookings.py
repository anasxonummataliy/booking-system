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
