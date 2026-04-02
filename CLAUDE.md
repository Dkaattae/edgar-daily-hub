# CLAUDE.md

## Project Overview

EDGAR Daily Hub - a full-stack app that automates daily ingestion of SEC EDGAR filing data and provides analytics/tracking for financial analysts. Users can monitor filing volume spikes by form type, track company tickers via a personal watchlist, and view historical filing trends.

**Live:** https://edgar-daily-hub.fly.dev

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite, TailwindCSS, shadcn/ui (Radix), React Query, React Router v6, Recharts
- **Backend:** Python 3.11 + FastAPI, served by Uvicorn
- **Auth:** Supabase (JWT-based), with Row-Level Security on Postgres
- **Data Warehouse:** MotherDuck (cloud DuckDB) for EDGAR analytical data
- **Data Pipeline:** Bruin orchestration (Python + SQL assets)
- **Deployment:** Fly.io (Docker), GitHub Actions for daily pipeline cron

## Project Structure

```
├── backend/          # FastAPI app (main.py, auth.py, database.py, motherduck.py)
├── frontend/         # React SPA (src/pages, src/components, src/lib)
├── data-pipeline/    # Bruin pipeline assets (ingestion, cleaning, reporting SQL/Python)
├── .github/workflows/  # GitHub Actions (daily EDGAR ingestion cron)
├── Dockerfile        # Multi-stage build (frontend build -> backend serve)
├── docker-compose.yml
└── fly.toml          # Fly.io config (auto-scale 0-1, 512MB)
```

## Development Commands

```bash
# Start both frontend + backend concurrently (from root)
npm start

# Frontend only (from frontend/)
npm run dev           # Vite dev server
npm run build         # Production build
npm run lint          # ESLint
npm run test          # Vitest unit tests
npm run test:watch    # Watch mode

# Backend only (from backend/, with venv activated)
uvicorn main:app --reload --port 8000
pytest test_main.py   # API tests

# Docker
docker-compose up --build

# Data pipeline (from data-pipeline/)
bruin run . --config-file .bruin.yml
```

## Environment Variables

Required secrets (never commit `.env` files):
- `MOTHERDUCK_TOKEN` - MotherDuck access token (required for EDGAR data queries)
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` - Supabase project credentials
- `DATABASE_URL` - Postgres connection string (defaults to docker-compose DB)
- Frontend vars must use `VITE_` prefix (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

## Architecture Notes

- **Single container deployment:** Multi-stage Docker build bundles React dist into the FastAPI backend, served on port 8000
- **Two databases:** Postgres (Supabase) for auth/watchlist, MotherDuck (DuckDB) for EDGAR analytical data
- **Pipeline idempotency:** All Bruin assets delete previous day's data before insert
- **Auth flow:** Frontend gets JWT from Supabase -> sends as Bearer token -> backend verifies and auto-creates local user on first login
- **Daily schedule:** GitHub Actions runs pipeline Tue-Sat 6 AM UTC (after SEC publishes indices)
- **Protected routes:** Frontend wraps authenticated pages in `<ProtectedRoute>` component

## API Endpoints

- `POST /api/auth/register`, `POST /api/auth/login` - Auth
- `GET /api/reports/daily-count` - Latest filing counts by form type
- `GET /api/reports/all-daily-counts` - Historical time-series
- `GET /api/reports/by-ticker?tickers=AAPL,MSFT` - Filings for tickers
- `GET/POST/DELETE /api/watchlist` - Watchlist CRUD
- `GET /health` - Health check
