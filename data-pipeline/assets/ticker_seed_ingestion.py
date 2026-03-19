""" @bruin
name: ticker_seed_ingestion
type: python
depends: []
@bruin """

import requests
import pandas as pd
import duckdb

def main():
    url = "https://www.sec.gov/files/company_tickers.json"
    headers = {
        "User-Agent": "DataPipelineRunner <pipeline@example.com>"
    }
    print(f"Fetching company tickers from {url}")
    
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    data = resp.json()
    
    # The SEC JSON format is: {"0":{"cik_str":320193,"ticker":"AAPL","title":"Apple Inc."}, ...}
    records = []
    for key, val in data.items():
        records.append({
            "cik_str": val.get("cik_str"),
            "ticker": val.get("ticker"),
            "title": val.get("title")
        })
        
    df = pd.DataFrame(records)
    print(f"Parsed {len(df)} tickers.")
    
    conn = duckdb.connect('md:')
    
    conn.execute("DROP TABLE IF EXISTS raw_company_tickers")
    conn.execute('''
    CREATE TABLE raw_company_tickers (
        cik_str BIGINT,
        ticker VARCHAR,
        title VARCHAR
    )
    ''')
    
    conn.execute("INSERT INTO raw_company_tickers SELECT * FROM df")
    
    print("Successfully inserted raw_company_tickers data into MotherDuck.")
    conn.close()

if __name__ == "__main__":
    main()
