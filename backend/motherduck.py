import duckdb
from .models import DailyCount, Filing
import uuid

def fetch_daily_counts():
    conn = duckdb.connect('md:')
    try:
        res = conn.execute("""
            SELECT date_filed, form_type, filing_count
            FROM report_daily_filing_count
            ORDER BY date_filed DESC, filing_count DESC
            LIMIT 100
        """).fetchall()
        return [DailyCount(date_filed=r[0], form_type=r[1], filing_count=r[2]) for r in res]
    except Exception as e:
        print(f"Error fetching daily counts: {e}")
        return []
    finally:
        conn.close()

def fetch_filings_by_tickers(tickers: list[str]):
    if not tickers:
        return []
    
    conn = duckdb.connect('md:')
    ticker_list = "'" + "','".join(tickers) + "'"
    try:
        res = conn.execute(f"""
            SELECT raw_submission_number, ticker, company_name, form_type, date_filed, document_url
            FROM report_filings_by_ticker
            WHERE ticker IN ({ticker_list})
            ORDER BY date_filed DESC
            LIMIT 200
        """).fetchall()
        
        return [
            Filing(
                id=r[0] or str(uuid.uuid4()),
                ticker=r[1],
                companyName=r[2],
                formType=r[3],
                timestamp=r[4],
                filingUrl=r[5]
            ) for r in res
        ]
    except Exception as e:
        print(f"Error fetching filings: {e}")
        return []
    finally:
        conn.close()
