-- The next session a therapist set from the doctor link (docs/03-ARCHITECTURE.md §6.2).
-- One plan per patient. The next session from the patient's glasses deletes it (it was used).
CREATE TABLE plans (
  patient_id TEXT PRIMARY KEY REFERENCES patients(id) ON DELETE CASCADE,
  preset TEXT NOT NULL,
  hint_delay_s INTEGER NOT NULL,
  share_id TEXT,
  set_at INTEGER NOT NULL
);
