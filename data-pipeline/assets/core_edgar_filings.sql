/* @bruin
name: core_edgar_filings
type: duckdb.sql
depends:
  - clean_edgar_data
  - ticker_seed_ingestion
materialization:
  type: table
@bruin */

SELECT 
    e.company_name,
    e.form_type,
    e.is_amendment,
    e.date_filed,
    e.filename,
    e.document_url,
    e.raw_submission_number,
    e.clean_submission_number,
    e.filing_index_url,
    e.bruin_run_date,
    e.cik_num,
    e.cik_str,
    t.ticker,
    t.title AS ticker_company_title
FROM my_db.main.clean_edgar_daily e
LEFT JOIN my_db.main.raw_company_tickers t 
  ON e.cik_num = t.cik_str;
