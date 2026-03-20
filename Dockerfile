# --- Stage 1: Build the React Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /build

# Install dependencies first for Docker caching
COPY frontend/package*.json ./
RUN npm install

# Build the frontend assets
COPY frontend .
RUN npm run build

# --- Stage 2: Serve via Python FastAPI ---
FROM python:3.11-slim
WORKDIR /app

# System dependencies for psycopg2 (if needed by SQLAlchemy)
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Install python requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend .

# Copy compiled React UI from Stage 1 directly into the Python service context
COPY --from=frontend-builder /build/dist ./frontend/dist

# Expose backend port
EXPOSE 8000

# Run FastAPI via Uvicorn flawlessly on start
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
