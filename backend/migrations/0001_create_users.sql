-- ============================================================
-- Migration 0001: สร้างตาราง users และ sessions
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  username    TEXT    NOT NULL,
  email       TEXT    NOT NULL UNIQUE,
  password    TEXT    NOT NULL,  -- hashed with bcrypt
  phone       TEXT,
  dob         TEXT,
  gender      TEXT,
  role        TEXT    NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),

  -- Address
  street      TEXT,
  alley       TEXT,
  subdistrict TEXT,
  district    TEXT,
  province    TEXT,
  postal_code TEXT CHECK(postal_code IS NULL OR length(postal_code) = 5),

  -- Timestamps
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Index for fast login lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);

-- Sessions table (token-based auth)
CREATE TABLE IF NOT EXISTS sessions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  token      TEXT    NOT NULL UNIQUE,
  expires_at TEXT    NOT NULL,  -- ISO 8601
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_token    ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id  ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires  ON sessions(expires_at);
