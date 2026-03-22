-- ================================================================
-- DYS-Detect — Migration V2 : Multi-Troubles (TDAH + TSA)
-- À coller et exécuter dans : Supabase > SQL Editor > New query
-- ================================================================

-- 1. Ajout colonnes ULIS sur la table students
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_ulis_student BOOLEAN DEFAULT FALSE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS consent_status TEXT DEFAULT 'pending';
ALTER TABLE students ADD COLUMN IF NOT EXISTS consent_date TIMESTAMPTZ;
ALTER TABLE students ADD COLUMN IF NOT EXISTS consent_guardian_name TEXT;

-- 2. Ajout colonnes multi-troubles sur analysis_results
ALTER TABLE analysis_results ADD COLUMN IF NOT EXISTS analysis_mode TEXT NOT NULL DEFAULT 'dictee';
ALTER TABLE analysis_results ADD COLUMN IF NOT EXISTS reference_text TEXT;
ALTER TABLE analysis_results ADD COLUMN IF NOT EXISTS audio_metadata JSONB;
ALTER TABLE analysis_results ADD COLUMN IF NOT EXISTS disorder_screening JSONB;
ALTER TABLE analysis_results ADD COLUMN IF NOT EXISTS audio_blob_path TEXT;

-- 3. Table des diagnostics confirmés (données d'entraînement labelisées)
CREATE TABLE IF NOT EXISTS diagnostic_labels (
  id               TEXT PRIMARY KEY,
  student_id       TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  disorder         TEXT NOT NULL,    -- 'DYS', 'TDAH', 'TSA'
  subtype          TEXT,             -- 'dyslexie', 'TDAH-C', 'TSA-1', etc.
  confirmed_by     TEXT NOT NULL,    -- 'orthophoniste', 'neuropsychologue', 'MDPH'
  confirmed_date   TEXT NOT NULL,
  severity         TEXT,             -- 'leger', 'modere', 'severe'
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_labels_student ON diagnostic_labels(student_id);
CREATE INDEX IF NOT EXISTS idx_labels_disorder ON diagnostic_labels(disorder);

-- 4. Journal d'audit RGPD (consentement)
CREATE TABLE IF NOT EXISTS consent_audit_log (
  id            TEXT PRIMARY KEY,
  student_id    TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  action        TEXT NOT NULL,       -- 'consent_given', 'consent_withdrawn', 'data_exported', 'data_deleted'
  performed_by  TEXT,
  performed_at  TIMESTAMPTZ DEFAULT NOW(),
  details       JSONB
);

-- 5. Journal des exports de données d'entraînement
CREATE TABLE IF NOT EXISTS training_exports (
  id           TEXT PRIMARY KEY,
  export_date  TIMESTAMPTZ DEFAULT NOW(),
  format       TEXT NOT NULL,        -- 'jsonl', 'csv'
  record_count INTEGER NOT NULL,
  filters      JSONB,
  exported_by  TEXT,
  file_path    TEXT
);

-- 6. RLS sur les nouvelles tables
ALTER TABLE diagnostic_labels  ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_audit_log  ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_exports   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read labels"     ON diagnostic_labels FOR SELECT USING (true);
CREATE POLICY "Public insert labels"   ON diagnostic_labels FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update labels"   ON diagnostic_labels FOR UPDATE USING (true);
CREATE POLICY "Public delete labels"   ON diagnostic_labels FOR DELETE USING (true);

CREATE POLICY "Public read audit"      ON consent_audit_log FOR SELECT USING (true);
CREATE POLICY "Public insert audit"    ON consent_audit_log FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read exports"    ON training_exports FOR SELECT USING (true);
CREATE POLICY "Public insert exports"  ON training_exports FOR INSERT WITH CHECK (true);

-- 7. Index performance
CREATE INDEX IF NOT EXISTS idx_results_mode ON analysis_results(analysis_mode);
CREATE INDEX IF NOT EXISTS idx_students_ulis ON students(is_ulis_student) WHERE is_ulis_student = TRUE;
