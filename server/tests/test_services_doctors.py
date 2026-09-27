from datetime import date, timedelta


def test_list_services(client, test_service):
    response = client.get("/api/v1/services")
    assert response.status_code == 200
    services = response.json()
    assert len(services) >= 1
    assert any(s["id"] == test_service.id for s in services)


def test_list_doctors(client, test_doctor):
    response = client.get("/api/v1/doctors")
    assert response.status_code == 200
    doctors = response.json()
    assert len(doctors) >= 1
    assert any(d["id"] == test_doctor.id for d in doctors)


def test_doctor_slots_generation(client, test_doctor):
    # Test tomorrow slots
    target_date = date.today() + timedelta(days=1)
    response = client.get(f"/api/v1/doctors/{test_doctor.id}/slots?date={target_date.isoformat()}")
    assert response.status_code == 200
    slots = response.json()
    assert len(slots) > 0
    # Break time 13:00 - 14:00 should not be available
    break_slot = next((s for s in slots if "13:00" in s["display_time"]), None)
    if break_slot:
        assert break_slot["is_available"] is False
