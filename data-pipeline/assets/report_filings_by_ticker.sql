/* @bruin
name: report_filings_by_ticker
type: duckdb.sql
depends:
  - core_edgar_filings
materialization:
  type: view
@bruin */

SELECT *
FROM core_edgar_filings
WHERE ticker IS NOT NULL;
