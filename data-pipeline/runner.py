import os
import datetime
import subprocess

start_date = datetime.date(2026, 1, 1)
end_date = datetime.date(2026, 2, 21)

curr = start_date
while curr <= end_date:
    env = os.environ.copy()
    env["BRUIN_START_DATE"] = curr.strftime("%Y-%m-%d")
    print(f"Running for {curr}...")
    subprocess.run(["python", "assets/edgar_daily_ingestion.py"], env=env, check=True)
    curr += datetime.timedelta(days=1)
