import os
import duckdb

token = os.getenv("MOTHERDUCK_TOKEN")
conn = duckdb.connect(f"md:?motherduck_token={token}" if token else "md:")

print("Updating all URLs in clean_edgar_daily...")
conn.execute("""
UPDATE my_db.main.clean_edgar_daily
SET filing_index_url = 'https://www.sec.gov/Archives/edgar/data/' || CAST(CAST(cik_num AS BIGINT) AS VARCHAR) || '/' || 
    clean_submission_number || '/' ||
    raw_submission_number || '-index.htm'
""")
print("Done.")
