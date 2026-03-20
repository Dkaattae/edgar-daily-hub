import os
import duckdb

token = os.getenv("MOTHERDUCK_TOKEN")
conn = duckdb.connect(f"md:?motherduck_token={token}" if token else "md:")

# 1. Update Core Table
with open("assets/core_edgar_filings.sql", "r") as f:
    sql = f.read()
query_part = sql.split("@bruin */")[1].strip()
create_table_sql = f"CREATE OR REPLACE TABLE my_db.main.core_edgar_filings AS {query_part}"
conn.execute(create_table_sql)
print("Successfully updated core_edgar_filings table in MotherDuck!")

# 2. Update Report View
with open("assets/report_filings_by_ticker.sql", "r") as f:
    sql2 = f.read()
query_part2 = sql2.split("@bruin */")[1].strip()
create_view_sql = f"CREATE OR REPLACE VIEW my_db.main.report_filings_by_ticker AS {query_part2}"
conn.execute(create_view_sql)
print("Successfully updated report_filings_by_ticker view in MotherDuck!")
