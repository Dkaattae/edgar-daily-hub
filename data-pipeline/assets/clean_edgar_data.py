""" @bruin
name: clean_edgar_data
type: python
depends:
  - edgar_daily_ingestion
@bruin """

import os
import duckdb
import datetime

def main():
    date_str = os.environ.get("BRUIN_START_DATE")
    if not date_str:
        date_str = datetime.datetime.now().strftime("%Y-%m-%d")
        
    date_obj = datetime.datetime.strptime(date_str, "%Y-%m-%d")
    date_formatted = date_obj.strftime("%Y%m%d")
    
    conn = duckdb.connect('md:')
    
    conn.execute('''
    CREATE TABLE IF NOT EXISTS clean_edgar_daily (
        cik_str VARCHAR,
        cik_num BIGINT,
        company_name VARCHAR,
        form_type VARCHAR,
        date_filed VARCHAR,
        filename VARCHAR,
        document_url VARCHAR,
        raw_submission_number VARCHAR,
        clean_submission_number VARCHAR,
        filing_index_url VARCHAR,
        bruin_run_date VARCHAR
    )
    ''')
    
    # Delete existing records for this run_date to ensure idempotency
    conn.execute(f"DELETE FROM clean_edgar_daily WHERE bruin_run_date = '{date_str}'")
    
    conn.execute(f'''
    INSERT INTO clean_edgar_daily 
    SELECT DISTINCT
        LPAD(CAST(CAST(cik AS BIGINT) AS VARCHAR), 10, '0') AS cik_str,
        CAST(cik AS BIGINT) AS cik_num,
        company_name,
        form_type,
        date_filed,
        filename,
        'https://www.sec.gov/Archives/' || filename AS document_url,
        REPLACE(split_part(filename, '/', 4), '.txt', '') AS raw_submission_number,
        REPLACE(REPLACE(split_part(filename, '/', 4), '.txt', ''), '-', '') AS clean_submission_number,
        'https://www.sec.gov/Archives/edgar/data/' || CAST(CAST(cik AS BIGINT) AS VARCHAR) || '/' || 
            REPLACE(REPLACE(split_part(filename, '/', 4), '.txt', ''), '-', '') || '/' AS filing_index_url,
        '{date_str}' as bruin_run_date
    FROM raw_edgar_daily
    WHERE date_filed = '{date_formatted}'
    ''')
    
    res = conn.execute(f"SELECT COUNT(*) FROM clean_edgar_daily WHERE bruin_run_date = '{date_str}'").fetchone()
    print(f"Successfully cleaned EDGAR data for {date_str}. Processed: {res[0]} records.")
    conn.close()

if __name__ == "__main__":
    main()
