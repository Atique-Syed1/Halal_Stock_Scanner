from fastapi.testclient import TestClient
from app.main import app
import pytest

client = TestClient(app)

def test_register_and_login():
    # 1. Register
    email = "test@example.com"
    password = "securepassword"
    
    response = client.post(
        "/register",
        json={"email": email, "password": password}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    
    # 2. Login
    response = client.post(
        "/token",
        data={"username": email, "password": password}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    
    # 3. Get Me
    token = data["access_token"]
    response = client.get(
        "/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == email

def test_login_fail():
    response = client.post(
        "/token",
        data={"username": "wrong@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
