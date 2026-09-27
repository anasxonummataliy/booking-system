import uuid


def test_register_user(client):
    unique_email = f"new_{uuid.uuid4().hex[:6]}@example.com"
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "full_name": "New User",
            "phone": "+998901234567",
            "password": "securepassword123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == unique_email
    assert data["user"]["full_name"] == "New User"


def test_register_duplicate_email(client):
    unique_email = f"dup_{uuid.uuid4().hex[:6]}@example.com"
    # First registration
    client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "full_name": "Original User",
            "password": "somepassword"
        }
    )
    # Duplicate registration attempt
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "full_name": "Another Name",
            "password": "somepassword"
        }
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"].lower()


def test_login_success(client):
    email = f"login_{uuid.uuid4().hex[:6]}@example.com"
    password = "password123"
    client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "full_name": "Login User",
            "password": password
        }
    )
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": password
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == email


def test_login_invalid_password(client):
    email = f"wrong_{uuid.uuid4().hex[:6]}@example.com"
    client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "full_name": "Wrong Pass User",
            "password": "correctpassword"
        }
    )
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401


def test_get_current_user_me(client):
    email = f"me_{uuid.uuid4().hex[:6]}@example.com"
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "full_name": "Me User",
            "password": "password123"
        }
    )
    token = reg_resp.json()["access_token"]
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == email
