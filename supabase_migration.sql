-- ================================================================
-- DYS-Detect — Migration Supabase
-- À coller et exécuter dans : Supabase > SQL Editor > New query
-- ================================================================

-- 1. Table des élèves
CREATE TABLE IF NOT EXISTS students (
  id                 TEXT PRIMARY KEY,
  first_name         TEXT NOT NULL,
  last_name          TEXT NOT NULL,
  initials           TEXT NOT NULL,
  grade              TEXT NOT NULL,
  age                INTEGER NOT NULL CHECK (age BETWEEN 3 AND 18),
  last_analysis_date TEXT,
  risk_level         TEXT NOT NULL DEFAULT 'Non identifié',
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des résultats d'analyse
CREATE TABLE IF NOT EXISTS analysis_results (
  id                TEXT PRIMARY KEY,
  student_id        TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date              TEXT NOT NULL,
  global_risk_level TEXT NOT NULL,
  transcription     TEXT NOT NULL,
  markers           JSONB NOT NULL DEFAULT '[]',
  recommendations   JSONB NOT NULL DEFAULT '[]',
  handwriting_image TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Index pour accélérer les recherches par élève
CREATE INDEX IF NOT EXISTS idx_results_student_id ON analysis_results(student_id);

-- 4. Row Level Security — accès public pour prototype (sans auth)
--    ⚠️ À remplacer par des policies per-user quand NextAuth/Clerk sera intégré
ALTER TABLE students        ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read students"
  ON students FOR SELECT USING (true);

CREATE POLICY "Public insert students"
  ON students FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update students"
  ON students FOR UPDATE USING (true);

CREATE POLICY "Public delete students"
  ON students FOR DELETE USING (true);

CREATE POLICY "Public read results"
  ON analysis_results FOR SELECT USING (true);

CREATE POLICY "Public insert results"
  ON analysis_results FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update results"
  ON analysis_results FOR UPDATE USING (true);

CREATE POLICY "Public delete results"
  ON analysis_results FOR DELETE USING (true);
