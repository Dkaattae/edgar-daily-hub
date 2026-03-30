from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker

import os

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin:password123@db:5432/edgar_auth")
# Supabase / Heroku emit postgres:// but SQLAlchemy requires postgresql://
SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    auth_id = Column(String(36), unique=True, index=True, nullable=False)  # Supabase UUID

class WatchlistTicker(Base):
    __tablename__ = "watchlist_tickers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    ticker = Column(String(20), nullable=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
