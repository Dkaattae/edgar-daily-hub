CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

INSERT INTO users (username, auth_id)
VALUES ('admin', 'auth_id_value');