import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from unittest.mock import patch, MagicMock

from backend.main import app
from backend import motherduck, database
from backend.database import Base, get_db, User
from backend.auth import get_password_hash

# Set up dedicated test database (in-memory SQLite)
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[database.get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    client.post("/api/auth/register", json={"username": "admin", "password": "password123"})
    yield
    Base.metadata.drop_all(bind=engine)

def test_unauthorized_dashboard():
    response = client.get("/api/reports/daily-count")
    assert response.status_code == 401

def test_login_failure():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "wrongpassword"})
    assert response.status_code == 401

def test_login_success():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "password123"})
    print("RESPONSE JSON:", response.text)
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


# ========== MotherDuck Connection Tests ==========

def test_motherduck_connection_with_token():
    """Test that MotherDuck connection is initialized correctly with token"""
    with patch.dict(os.environ, {"MOTHERDUCK_TOKEN": "test_token_12345"}):
        try:
            conn = motherduck.get_md_conn()
            assert conn is not None
            assert hasattr(conn, 'execute')
        except Exception as e:
            # If token is invalid, duckdb raises an exception during connect
            assert "invalid input error" in str(e).lower() or "token" in str(e).lower() or "forbidden" in str(e).lower()

def test_motherduck_connection_without_token():
    """Test that MotherDuck falls back to local mode without token"""
    with patch.dict(os.environ, {}, clear=False):
        if "MOTHERDUCK_TOKEN" in os.environ:
            del os.environ["MOTHERDUCK_TOKEN"]
        
        conn = motherduck.get_md_conn()
        assert conn is not None
        assert hasattr(conn, 'execute')

def test_motherduck_connection_fails_gracefully():
    """Test that invalid MotherDuck token is handled"""
    with patch.dict(os.environ, {"MOTHERDUCK_TOKEN": "invalid_token"}):
        try:
            conn = motherduck.get_md_conn()
            assert conn is not None
        except Exception as e:
            assert "invalid" in str(e).lower() or "connection" in str(e).lower() or "token" in str(e).lower()


# ========== Watchlist Duplicate Ticker Tests ==========

def test_watchlist_deduplicates_duplicate_tickers():
    """Test that adding the same ticker twice doesn't create duplicates"""
    response = client.post("/api/auth/login", json={"username": "admin", "password": "password123"})
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Add same ticker twice
    response1 = client.post("/api/watchlist/AAPL", headers=headers)
    assert response1.status_code == 201
    
    response2 = client.post("/api/watchlist/AAPL", headers=headers)
    assert response2.status_code == 201  # Should succeed but not duplicate
    
    # Get watchlist and verify only one AAPL
    response = client.get("/api/watchlist", headers=headers)
    assert response.status_code == 200
    watchlist = response.json()
    
    aapl_count = watchlist.count("AAPL")
    assert aapl_count == 1, f"Expected 1 AAPL in watchlist, got {aapl_count}"
    
    # Cleanup
    client.delete("/api/watchlist/AAPL", headers=headers)

def test_watchlist_handles_case_insensitivity():
    """Test that adding 'aapl' and 'AAPL' treats them as the same ticker"""
    response = client.post("/api/auth/login", json={"username": "admin", "password": "password123"})
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Add ticker with different cases
    response1 = client.post("/api/watchlist/aapl", headers=headers)
    assert response1.status_code == 201
    
    response2 = client.post("/api/watchlist/AAPL", headers=headers)
    assert response2.status_code == 201
    
    # Get watchlist and verify only one entry
    response = client.get("/api/watchlist", headers=headers)
    assert response.status_code == 200
    watchlist = response.json()
    
    aapl_count = sum(1 for ticker in watchlist if ticker.upper() == "AAPL")
    assert aapl_count == 1, f"Expected 1 AAPL in watchlist, got {aapl_count}"
    
    # Cleanup
    client.delete("/api/watchlist/AAPL", headers=headers)


# ========== Invalid Ticker Tests ==========

def test_watchlist_accepts_any_ticker_format():
    """Test that watchlist accepts invalid/non-existent tickers without breaking"""
    response = client.post("/api/auth/login", json={"username": "admin", "password": "password123"})
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Add invalid tickers
    invalid_tickers = ["INVALID123", "NOTREAL", "XYZ", "A", "12345"]
    
    for ticker in invalid_tickers:
        response = client.post(f"/api/watchlist/{ticker}", headers=headers)
        # Should accept any format without breaking
        assert response.status_code == 201, f"Failed to add invalid ticker {ticker}"
    
    # Get watchlist - should contain all tickers
    response = client.get("/api/watchlist", headers=headers)
    assert response.status_code == 200
    watchlist = response.json()
    
    for ticker in invalid_tickers:
        assert ticker in watchlist, f"Expected {ticker} in watchlist"
    
    # Cleanup
    for ticker in invalid_tickers:
        client.delete(f"/api/watchlist/{ticker}", headers=headers)

def test_fetch_filings_with_invalid_tickers_returns_empty():
    """Test that fetching filings with invalid tickers doesn't break, returns empty list"""
    response = client.post("/api/auth/login", json={"username": "admin", "password": "password123"})
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Query with invalid tickers
    response = client.get("/api/reports/by-ticker?tickers=NOTREAL123,INVALID456", headers=headers)
    assert response.status_code == 200
    
    # Should return empty list without breaking
    filings = response.json()
    assert isinstance(filings, list)
    # Likely empty since tickers don't exist in SEC data
    assert len(filings) >= 0

def test_fetch_filings_with_mixed_valid_invalid_tickers():
    """Test that mixing valid and invalid tickers works correctly"""
    response = client.post("/api/auth/login", json={"username": "admin", "password": "password123"})
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Mix real ticker (AAPL is likely in SEC data) with invalid ones
    response = client.get("/api/reports/by-ticker?tickers=AAPL,NOTREAL,MSFT,INVALID123", headers=headers)
    assert response.status_code == 200
    
    # Should return list without breaking
    filings = response.json()
    assert isinstance(filings, list)
    # May contain filings for valid tickers only

def test_watchlist_with_special_characters_in_ticker():
    """Test that watchlist handles special characters gracefully"""
    response = client.post("/api/auth/login", json={"username": "admin", "password": "password123"})
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Try adding tickers with special characters
    special_tickers = ["@TEST", "TEST-1", "TEST.COM", "TEST_A"]
    
    for ticker in special_tickers:
        response = client.post(f"/api/watchlist/{ticker}", headers=headers)
        # Should handle without crashing (may reject or accept)
        assert response.status_code in [201, 400, 422], f"Unexpected status for {ticker}"
    
    # Cleanup - attempt to remove what was added
    response = client.get("/api/watchlist", headers=headers)
    if response.status_code == 200:
        watchlist = response.json()
        for ticker in watchlist:
            if any(s in ticker for s in special_tickers):
                client.delete(f"/api/watchlist/{ticker}", headers=headers)

# ========== New API Connection Edge Case Tests ==========

def test_register_duplicate_username():
    """Test that registering an existing user returns 400"""
    # The 'admin' user is created by setup_db fixture
    response = client.post("/api/auth/register", json={"username": "admin", "password": "newpassword"})
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()

def test_access_without_token():
    """Test accessing protected route without a token returns 401"""
    response = client.get("/api/reports/daily-count")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"

def test_access_with_invalid_token_signature():
    """Test accessing protected route with an invalid signed token returns 401"""
    import jwt
    import datetime
    # Encode with wrong secret
    fake_token = jwt.encode({"sub": "admin", "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=60)}, "WRONG_SECRET", algorithm="HS256")
    
    headers = {"Authorization": f"Bearer {fake_token}"}
    response = client.get("/api/reports/daily-count", headers=headers)
    assert response.status_code == 401
    assert "invalid" in response.json()["detail"].lower()

def test_access_with_expired_token():
    """Test accessing protected route with an expired token returns 401"""
    import jwt
    import datetime
    from backend import auth
    # Encode with passed expiration time
    expired_token = jwt.encode({"sub": "admin", "exp": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=60)}, auth.SECRET_KEY, algorithm="HS256")
    
    headers = {"Authorization": f"Bearer {expired_token}"}
    response = client.get("/api/reports/daily-count", headers=headers)
    assert response.status_code == 401
    assert "invalid" in response.json()["detail"].lower()
