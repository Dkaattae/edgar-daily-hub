/* @bruin
name: report_filings_by_ticker
type: duckdb.sql
depends:
  - core_edgar_filings
materialization:
  type: view
@bruin */

-- For each ticker + form_type combo, keep only the latest filing date.
-- Show whether that latest filing was an amendment.
SELECT
    ticker,
    ticker_company_title,
    form_type,
    MAX(date_filed) AS date_filed,
    BOOL_OR(is_amendment) AS is_amendment,
    FIRST(document_url ORDER BY date_filed DESC) AS document_url,
    FIRST(filing_index_url ORDER BY date_filed DESC) AS filing_index_url,
    FIRST(raw_submission_number ORDER BY date_filed DESC) AS raw_submission_number,
    FIRST(company_name ORDER BY date_filed DESC) AS company_name,
    FIRST(cik_str ORDER BY date_filed DESC) AS cik_str,
    FIRST(cik_num ORDER BY date_filed DESC) AS cik_num
FROM core_edgar_filings
WHERE ticker IS NOT NULL
GROUP BY ticker, ticker_company_title, form_type
ORDER BY ticker, date_filed DESC;
