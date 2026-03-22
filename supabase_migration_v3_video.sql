-- ============================================================
-- DYS-Detect — Migration v3 : Support analyse vidéo
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- 1. Ajouter la colonne video_metadata dans analysis_results
ALTER TABLE analysis_results
  ADD COLUMN IF NOT EXISTS video_metadata JSONB;

-- 2. Ajouter audio_blob_path si elle n'existe pas déjà (v2 compat)
ALTER TABLE analysis_results
  ADD COLUMN IF NOT EXISTS audio_blob_path TEXT;

-- 3. Ajouter video_blob_path pour stockage futur
ALTER TABLE analysis_results
  ADD COLUMN IF NOT EXISTS video_blob_path TEXT;

-- 4. Index pour requêtes sur données vidéo (recherche future)
CREATE INDEX IF NOT EXISTS idx_analysis_results_video_metadata
  ON analysis_results USING GIN (video_metadata);

-- 5. Table pour les sessions d'observation vidéo (Phase 3 — facultative)
-- Note: student_id et analysis_result_id sont TEXT pour correspondre aux tables existantes
CREATE TABLE IF NOT EXISTS video_observations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  analysis_result_id TEXT REFERENCES analysis_results(id) ON DELETE SET NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_ms INTEGER,
  video_blob_path TEXT,              -- stockage Supabase Storage (si activé)
  video_metadata JSONB,              -- VideoMetadata extrait
  processing_status TEXT DEFAULT 'pending'
    CHECK (processing_status IN ('pending', 'processing', 'done', 'error')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS pour video_observations
ALTER TABLE video_observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage video observations"
  ON video_observations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_video_observations_student_id
  ON video_observations(student_id);

CREATE INDEX IF NOT EXISTS idx_video_observations_analysis_id
  ON video_observations(analysis_result_id);

-- Vérification
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'analysis_results'
  AND column_name IN ('video_metadata', 'audio_metadata', 'disorder_screening', 'analysis_mode', 'video_blob_path', 'audio_blob_path')
ORDER BY column_name;
