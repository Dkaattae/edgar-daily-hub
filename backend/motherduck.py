import duckdb
import os
from models import DailyCount, Filing
import uuid

def get_md_conn():
    token = os.getenv("MOTHERDUCK_TOKEN")
    return duckdb.connect(f"md:?motherduck_token={token}" if token else ":memory:")

def format_date(date_str: str) -> str:
    """Converts YYYYMMDD to YYYY-MM-DD."""
    if date_str and len(date_str) == 8 and date_str.isdigit():
        return f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:]}"
    return date_str or ""

def fetch_daily_counts():
    conn = get_md_conn()
    try:
        # Get counts for the latest available date (for summary cards)
        res = conn.execute("""
            SELECT date_filed, form_type, count(*) as filing_count
            FROM my_db.main.clean_edgar_daily
            WHERE date_filed = (SELECT MAX(date_filed) FROM my_db.main.clean_edgar_daily)
            GROUP BY date_filed, form_type
            ORDER BY filing_count DESC
            LIMIT 100
        """).fetchall()
        return [
            DailyCount(
                date_filed=format_date(r[0]),
                form_type=r[1],
                filing_count=r[2]
            ) for r in res
        ]
    except Exception as e:
        print(f"Error fetching daily counts: {e}")
        return []
    finally:
        conn.close()

def fetch_all_daily_counts():
    conn = get_md_conn()
    try:
        # Get counts per day per form type across all dates (for time series chart)
        res = conn.execute("""
            SELECT date_filed, form_type, count(*) as filing_count
            FROM my_db.main.clean_edgar_daily
            GROUP BY date_filed, form_type
            ORDER BY date_filed ASC, filing_count DESC
        """).fetchall()
        return [
            DailyCount(
                date_filed=format_date(r[0]),
                form_type=r[1],
                filing_count=r[2]
            ) for r in res
        ]
    except Exception as e:
        print(f"Error fetching all daily counts: {e}")
        return []
    finally:
        conn.close()


def ticker_exists(ticker: str) -> bool:
    """Check whether a ticker exists in the SEC company-tickers seed table."""
    if not ticker:
        return False
    conn = get_md_conn()
    try:
        res = conn.execute(
            "SELECT 1 FROM my_db.main.raw_company_tickers WHERE UPPER(ticker) = ? LIMIT 1",
            [ticker.upper()],
        ).fetchone()
        return res is not None
    except Exception as e:
        print(f"Error validating ticker {ticker}: {e}")
        return False
    finally:
        conn.close()


def fetch_filings_by_tickers(tickers: list[str]):
    if not tickers:
        return []

    conn = get_md_conn()
    ticker_params = ",".join(["?"] * len(tickers))
    try:
        # Use the report view which already deduplicates per ticker+form_type
        res = conn.execute(f"""
            SELECT
                raw_submission_number,
                ticker,
                company_name,
                form_type,
                COALESCE(is_amendment, FALSE) AS is_amendment,
                date_filed,
                filing_index_url
            FROM my_db.main.report_filings_by_ticker
            WHERE ticker IN ({ticker_params})
            ORDER BY ticker, date_filed DESC
        """, tickers).fetchall()

        return [
            Filing(
                id=r[0] or str(uuid.uuid4()),
                ticker=r[1],
                companyName=r[2],
                formType=r[3],
                isAmendment=bool(r[4]),
                timestamp=format_date(r[5]),
                filingUrl=r[6] or ""
            ) for r in res
        ]
    except Exception as e:
        print(f"Error fetching filings for {tickers}: {e}")
        return []
    finally:
        conn.close()


