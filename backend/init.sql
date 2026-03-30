CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    auth_id VARCHAR(36) UNIQUE NOT NULL
);

CREATE TABLE watchlist_tickers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticker VARCHAR(20) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_watchlist_tickers_user_id ON watchlist_tickers(user_id);