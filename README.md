# EDGAR Daily Hub

🚀 **Live:** [https://edgar-daily-hub.fly.dev](https://edgar-daily-hub.fly.dev)

## Problem

The SEC EDGAR system processes thousands of filings every business day, but there's no easy way to monitor filing volumes over time or track specific companies you care about. Analysts and researchers who want to spot unusual activity — like the massive surge in Form 3 "Initial Statement of Beneficial Ownership" filings observed in March 2026 — have to do this manually.

**EDGAR Daily Hub** solves this by:
- **Automating daily ingestion** of the EDGAR filing index into a cloud data warehouse
- **Surfacing outliers** — unusual spikes in filing volume by form type, visually
- **Letting users build a personal watchlist** of tickers to track SEC filings for specific companies
- **Providing historical trend analysis** across all form types over time

## Use Case

A financial analyst suspects unusual insider activity. They open EDGAR Daily Hub, see a spike in Form 3 filings on the dashboard, and drill into their watchlist to check if their tracked companies filed anything. All without touching the SEC website.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite + TypeScript) |
| Backend | Python / FastAPI |
| Auth DB | Supabase (Postgres) |
| Data Warehouse | MotherDuck (DuckDB) |
| Data Pipeline | Bruin |
| Deployment | Fly.io (Docker) |
| CI/CD | GitHub Actions |

---

## Running Locally

### Prerequisites
- Node.js 20+
- Python 3.11+
- A [MotherDuck](https://motherduck.com) account and token
- A [Supabase](https://supabase.com) project (for the auth/watchlist Postgres DB)

### 1. Clone the repo

```bash
git clone https://github.com/Dkaattae/edgar-daily-hub.git
cd edgar-daily-hub
```

### 2. Set environment variables

Create a `.env` file in the root:

```env
MOTHERDUCK_TOKEN=your_motherduck_token
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### 3. Run with Docker (recommended)

```bash
docker build -t edgar-daily-hub .
docker run -p 8000:8000 --env-file .env edgar-daily-hub
```

Open [http://localhost:8000](http://localhost:8000).

### 4. Run without Docker

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install && npm run dev
```

### 5. Initialize the database (first time only)

```bash
python -c "import database; database.Base.metadata.create_all(database.engine)"
```

### 6. Supabase security (row-level security)

To prevent `rls_disabled_in_public` and restrict PostgREST access to per-user data, run:

```bash
psql "$DATABASE_URL" -f backend/supabase_rls.sql
```

Or execute the SQL block in Supabase SQL editor.

---

## Deploying to Fly.io

### Prerequisites
- [Fly.io](https://fly.io) account
- `flyctl` installed: `curl -L https://fly.io/install.sh | sh`

### Steps

```bash
# Login
flyctl auth login

# Create the app (first time only)
flyctl apps create edgar-daily-hub

# Set secrets
flyctl secrets set \
  MOTHERDUCK_TOKEN=your_token \
  DATABASE_URL=your_supabase_connection_string \
  --app edgar-daily-hub

# Deploy
flyctl deploy

# Initialize DB tables (first time only)
flyctl ssh console --app edgar-daily-hub \
  -C "python -c 'import database; database.Base.metadata.create_all(database.engine)'"
```

The app will be live at `https://edgar-daily-hub.fly.dev`.

---

## Data Pipeline

Daily ingestion is managed by [Bruin](https://bruin-data.github.io). It scrapes the EDGAR daily index, counts filings by form type, and loads results into MotherDuck.

**Manual run:**
```bash
bruin run .
```

**Automated:** A GitHub Actions cron job runs the pipeline on a daily schedule. See [`.github/workflows/edgar-daily-ingestion.yml`](.github/workflows/edgar-daily-ingestion.yml).
