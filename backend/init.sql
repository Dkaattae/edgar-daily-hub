CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

INSERT INTO users (username, password_hash)
VALUES ('admin', crypt('password123', gen_salt('bf')));
