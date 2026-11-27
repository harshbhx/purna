-- Purna Family schema v1. Keys and share tokens are stored only as SHA-256 hashes.
CREATE TABLE patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);

CREATE TABLE devices (
  device_id TEXT PRIMARY KEY,
  patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
  pair_code TEXT UNIQUE,
  pair_expires_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  device_id TEXT,
  patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
  received_at INTEGER NOT NULL,
  started_at TEXT NOT NULL,
  preset TEXT NOT NULL,
  left_hits INTEGER,
  left_total INTEGER,
  right_hits INTEGER,
  right_total INTEGER,
  coc REAL,
  hints INTEGER,
  max_left_deg REAL,
  ended_by TEXT,
  summary TEXT NOT NULL,
  json TEXT NOT NULL
);
CREATE INDEX sessions_patient ON sessions(patient_id, started_at DESC);
CREATE INDEX sessions_device ON sessions(device_id);

CREATE TABLE shares (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  revoked INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX shares_patient ON shares(patient_id);

CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  share_id TEXT,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX notes_patient ON notes(patient_id, created_at DESC);
