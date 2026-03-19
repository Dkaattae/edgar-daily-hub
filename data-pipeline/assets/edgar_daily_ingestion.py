""" @bruin
name: edgar_daily_ingestion
type: python
depends: []
@bruin """

import os
import sys
import datetime
import requests
import pandas as pd
import duckdb

def main():
    date_str = os.environ.get("BRUIN_START_DATE")
    if not date_str:
        date_str = datetime.datetime.now().strftime("%Y-%m-%d")
    
    date_obj = datetime.datetime.strptime(date_str, "%Y-%m-%d")
    year = date_obj.strftime("%Y")
    quarter = (date_obj.month - 1) // 3 + 1
    date_formatted = date_obj.strftime("%Y%m%d")
    
    url = f"https://www.sec.gov/Archives/edgar/daily-index/{year}/QTR{quarter}/master.{date_formatted}.idx"
    print(f"Fetching EDGAR daily index from: {url}")
    
    headers = {
        "User-Agent": "DataPipelineRunner <pipeline@example.com>"
    }
    
    resp = requests.get(url, headers=headers)
    if resp.status_code != 200:
        if resp.status_code == 404:
            print(f"No filing index found for {date_str} (404).")
            return
        resp.raise_for_status()
        
    lines = resp.text.split("\n")
    data_lines = []
    headers_found = False
    
    for line in lines:
        if not line.strip():
            continue
        if line.startswith("---"):
            headers_found = True
            continue
        
        # If we see lines with PIPEs before the dash line, they aren't data lines, 
        # EDGAR master.idx puts a separator "-----------------------" right before data
        if headers_found:
            parts = line.split("|")
            if len(parts) == 5:
                data_lines.append(parts)
                
    if not data_lines:
        print(f"No records parsed for {date_str}.")
        return
        
    df = pd.DataFrame(data_lines, columns=["cik", "company_name", "form_type", "date_filed", "filename"])
    # clean up any trailing newlines in filename
    df["filename"] = df["filename"].str.strip()
    
    # Connect to duckdb and insert
    conn = duckdb.connect('md:')
    
    # create table if not exists with correct schema
    conn.execute('''
        CREATE TABLE IF NOT EXISTS raw_edgar_daily (
            cik VARCHAR,
            company_name VARCHAR,
            form_type VARCHAR,
            date_filed VARCHAR,
            filename VARCHAR
        )
    ''')
    
    # ensure idempotency
    conn.execute(f"DELETE FROM raw_edgar_daily WHERE date_filed = '{date_formatted}'")
    
    # insert data
    conn.execute("INSERT INTO raw_edgar_daily SELECT * FROM df")
    
    print(f"Successfully inserted {len(df)} records for {date_str} into raw_edgar_daily.")
    conn.close()

if __name__ == "__main__":
    main()
