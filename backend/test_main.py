from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_unauthorized_dashboard():
    response = client.get("/api/reports/daily-count")
    assert response.status_code == 401

def test_login_failure():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "wrongpassword"})
    assert response.status_code == 401

def test_login_success():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "password123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_authorized_dashboard():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "password123"})
    token = response.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/reports/daily-count", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_authorized_ticker_filings():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "password123"})
    token = response.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/reports/by-ticker?tickers=AAPL,MSFT", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
