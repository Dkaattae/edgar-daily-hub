/* @bruin
name: report_daily_filing_count
type: duckdb.sql
schedule: daily
depends:
  - core_edgar_filings
materialization:
  type: table
@bruin */

SELECT 
    date_filed,
    form_type,
    COUNT(*) as filing_count
FROM core_edgar_filings
GROUP BY 1, 2
ORDER BY 1 DESC, filing_count DESC;
