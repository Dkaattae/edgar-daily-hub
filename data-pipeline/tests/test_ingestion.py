import os
import sys
import pytest
from unittest.mock import patch, MagicMock
import duckdb

# Add assets directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../assets')))

import edgar_daily_ingestion

import tempfile

@pytest.fixture
def test_db_path():
    with tempfile.TemporaryDirectory() as tmpdir:
        yield os.path.join(tmpdir, 'test.db')

real_connect = duckdb.connect

@pytest.fixture
def mock_duckdb(test_db_path):
    def fake_connect(*args, **kwargs):
        return real_connect(test_db_path)
        
    with patch('edgar_daily_ingestion.duckdb.connect', side_effect=fake_connect):
        yield test_db_path

@patch('edgar_daily_ingestion.requests.get')
def test_ingestion_403_forbidden(mock_get, mock_duckdb, capsys):
    """Test that ingestion gracefully exits on 403 Forbidden"""
    mock_resp = MagicMock()
    mock_resp.status_code = 403
    mock_get.return_value = mock_resp
    
    edgar_daily_ingestion.main()
    
    captured = capsys.readouterr()
    assert "Access forbidden" in captured.out
    
    # Verify no tables were created in the mocked db
    conn = duckdb.connect(mock_duckdb)
    tables = [r[0] for r in conn.execute("SHOW TABLES").fetchall()]
    assert 'raw_edgar_daily' not in tables
    conn.close()

@patch('edgar_daily_ingestion.requests.get')
def test_ingestion_404_not_found(mock_get, mock_duckdb, capsys):
    """Test that ingestion gracefully exits on 404 Not Found"""
    mock_resp = MagicMock()
    mock_resp.status_code = 404
    mock_get.return_value = mock_resp
    
    edgar_daily_ingestion.main()
    
    captured = capsys.readouterr()
    assert "No filing index found" in captured.out

@patch('edgar_daily_ingestion.requests.get')
def test_ingestion_empty_data(mock_get, mock_duckdb, capsys):
    """Test that ingestion exits cleanly when EDGAR file has no records"""
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.text = "Description: Master Index of EDGAR\n--------------------------------------------------------\n"
    mock_get.return_value = mock_resp
    
    edgar_daily_ingestion.main()
    
    captured = capsys.readouterr()
    assert "No records parsed" in captured.out

@patch('edgar_daily_ingestion.requests.get')
def test_ingestion_success_parsing(mock_get, mock_duckdb, capsys):
    """Test that valid EDGAR data is correctly parsed and inserted"""
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    
    mock_resp.text = """Description: Master Index
--------------------------------------------------------
1000045|NICHOLAS FINANCIAL INC|8-K|20260323|edgar/data/1000045/0001000045-26-000010.txt
1000180|SANDISK CORP|4|20260323|edgar/data/1000180/0001000180-26-000011.txt
"""
    mock_get.return_value = mock_resp
    
    edgar_daily_ingestion.main()
    
    captured = capsys.readouterr()
    assert "Successfully inserted 2 records" in captured.out
    
    # Verify table has 2 rows
    conn = duckdb.connect(mock_duckdb)
    count = conn.execute("SELECT COUNT(*) FROM raw_edgar_daily").fetchone()[0]
    assert count == 2
    
    # Verify data content
    data = conn.execute("SELECT cik, company_name FROM raw_edgar_daily ORDER BY cik").fetchall()
    assert data[0] == ('1000045', 'NICHOLAS FINANCIAL INC')
    assert data[1] == ('1000180', 'SANDISK CORP')
    conn.close()
