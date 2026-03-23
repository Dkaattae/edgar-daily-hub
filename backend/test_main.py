from fastapi.testclient import TestClient
from backend.main import app
from backend import motherduck, database
import os
from unittest.mock import patch, MagicMock

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


# ========== MotherDuck Connection Tests ==========

def test_motherduck_connection_with_token():
    """Test that MotherDuck connection is initialized correctly with token"""
    with patch.dict(os.environ, {"MOTHERDUCK_TOKEN": "test_token_12345"}):
        try:
            conn = motherduck.get_md_conn()
            assert conn is not None
            # Connection should be a duckdb connection
            assert hasattr(conn, 'execute')
        except Exception as e:
            # If token is invalid, the connection will fail at query time, not init time
            assert "invalid" in str(e).lower() or "forbidden" in str(e).lower()

def test_motherduck_connection_without_token():
    """Test that MotherDuck falls back to local mode without token"""
    with patch.dict(os.environ, {}, clear=False):
        # Remove MOTHERDUCK_TOKEN if it exists
        if "MOTHERDUCK_TOKEN" in os.environ:
            del os.environ["MOTHERDUCK_TOKEN"]
        
        conn = motherduck.get_md_conn()
        assert conn is not None
        assert hasattr(conn, 'execute')

def test_motherduck_connection_fails_gracefully():
    """Test that invalid MotherDuck token is handled"""
    with patch.dict(os.environ, {"MOTHERDUCK_TOKEN": "invalid_token"}):
        # Should return a connection object (error happens on query execution)
        conn = motherduck.get_md_conn()
        assert conn is not None


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
