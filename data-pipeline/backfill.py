import os
import datetime
import subprocess
import argparse

def run_backfill(start_date_str, end_date_str):
    """
    Runs the EDGAR data pipeline backfill for a given date range.
    """
    try:
        start_date = datetime.datetime.strptime(start_date_str, "%Y-%m-%d").date()
        end_date = datetime.datetime.strptime(end_date_str, "%Y-%m-%d").date()
    except ValueError:
        print("Error: Dates must be in YYYY-MM-DD format.")
        return

    if start_date > end_date:
        print("Error: Start date must be before or equal to the end date.")
        return

    curr = start_date
    while curr <= end_date:
        print(f"\n--- Processing {curr} ---")
        env = os.environ.copy()
        env["BRUIN_START_DATE"] = curr.strftime("%Y-%m-%d")
        
        try:
            # 1. Ingest raw data
            subprocess.run(["python", "assets/edgar_daily_ingestion.py"], env=env, check=True)
            # 2. Clean data
            subprocess.run(["python", "assets/clean_edgar_data.py"], env=env, check=True)
        except subprocess.CalledProcessError as e:
            print(f"Subprocess error processing {curr}: {e}")
        except Exception as e:
            print(f"Unexpected error processing {curr}: {e}")
            
        curr += datetime.timedelta(days=1)

    print("\nUpdating core materializations and views...")
    try:
        subprocess.run(["python", "update_view.py"], check=True)
        print(f"\n✅ Completed backfill from {start_date_str} to {end_date_str}!")
    except Exception as e:
        print(f"Error rebuilding models: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Backfill EDGAR daily filings.")
    parser.add_argument("--start", type=str, help="Start date in YYYY-MM-DD format (e.g., 2025-01-01)")
    parser.add_argument("--end", type=str, help="End date in YYYY-MM-DD format (e.g., 2025-12-31)")
    
    args = parser.parse_args()
    
    start_input = args.start
    end_input = args.end
    
    if not start_input:
        start_input = input("Enter start date (YYYY-MM-DD), e.g., 2025-01-01: ").strip()
    if not end_input:
        end_input = input("Enter end date (YYYY-MM-DD), e.g., 2025-12-31: ").strip()
        
    run_backfill(start_input, end_input)
