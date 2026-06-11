-- ================================================================
-- Geronimo Éclaireur — Migration V4 : Authentification & RLS par enseignant
-- À coller et exécuter dans : Supabase > SQL Editor > New query
--
-- Prérequis : activer l'authentification e-mail/mot de passe dans
-- Supabase > Authentication > Providers > Email.
--
-- ⚠️ À déployer EN MÊME TEMPS que la version de l'app qui inclut la
-- page /login : une fois cette migration appliquée, les clients non
-- authentifiés ne voient plus aucune donnée.
-- ================================================================

-- 1. Rattacher chaque élève à son enseignant (compte auth.users)
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

CREATE INDEX IF NOT EXISTS idx_students_teacher ON students(teacher_id);

-- ⚠️ Données existantes : les lignes créées avant cette migration ont
-- teacher_id NULL et deviendront invisibles. Pour les rattacher à un
-- compte, exécuter (en remplaçant l'e-mail) :
--   UPDATE students SET teacher_id =
--     (SELECT id FROM auth.users WHERE email = 'enseignant@ecole.fr')
--   WHERE teacher_id IS NULL;

-- 2. Supprimer les policies publiques du prototype (v1 + v2 + v3)
DROP POLICY IF EXISTS "Public read students"   ON students;
DROP POLICY IF EXISTS "Public insert students" ON students;
DROP POLICY IF EXISTS "Public update students" ON students;
DROP POLICY IF EXISTS "Public delete students" ON students;

DROP POLICY IF EXISTS "Public read results"   ON analysis_results;
DROP POLICY IF EXISTS "Public insert results" ON analysis_results;
DROP POLICY IF EXISTS "Public update results" ON analysis_results;
DROP POLICY IF EXISTS "Public delete results" ON analysis_results;

DROP POLICY IF EXISTS "Public read labels"   ON diagnostic_labels;
DROP POLICY IF EXISTS "Public insert labels" ON diagnostic_labels;
DROP POLICY IF EXISTS "Public update labels" ON diagnostic_labels;
DROP POLICY IF EXISTS "Public delete labels" ON diagnostic_labels;

DROP POLICY IF EXISTS "Public read audit"   ON consent_audit_log;
DROP POLICY IF EXISTS "Public insert audit" ON consent_audit_log;

DROP POLICY IF EXISTS "Public read exports"   ON training_exports;
DROP POLICY IF EXISTS "Public insert exports" ON training_exports;

DROP POLICY IF EXISTS "Authenticated users can manage video observations" ON video_observations;

-- 3. students : chaque enseignant ne voit que ses élèves
CREATE POLICY "Teacher reads own students" ON students
  FOR SELECT TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "Teacher inserts own students" ON students
  FOR INSERT TO authenticated
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teacher updates own students" ON students
  FOR UPDATE TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teacher deletes own students" ON students
  FOR DELETE TO authenticated
  USING (teacher_id = auth.uid());

-- 4. Tables filles : accès via la propriété de l'élève
--    (helper réutilisable pour les policies par jointure)
CREATE OR REPLACE FUNCTION owns_student(sid TEXT)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = sid AND s.teacher_id = auth.uid()
  );
$$;

CREATE POLICY "Teacher reads own results" ON analysis_results
  FOR SELECT TO authenticated USING (owns_student(student_id));
CREATE POLICY "Teacher inserts own results" ON analysis_results
  FOR INSERT TO authenticated WITH CHECK (owns_student(student_id));
CREATE POLICY "Teacher updates own results" ON analysis_results
  FOR UPDATE TO authenticated USING (owns_student(student_id)) WITH CHECK (owns_student(student_id));
CREATE POLICY "Teacher deletes own results" ON analysis_results
  FOR DELETE TO authenticated USING (owns_student(student_id));

CREATE POLICY "Teacher reads own labels" ON diagnostic_labels
  FOR SELECT TO authenticated USING (owns_student(student_id));
CREATE POLICY "Teacher inserts own labels" ON diagnostic_labels
  FOR INSERT TO authenticated WITH CHECK (owns_student(student_id));
CREATE POLICY "Teacher updates own labels" ON diagnostic_labels
  FOR UPDATE TO authenticated USING (owns_student(student_id)) WITH CHECK (owns_student(student_id));
CREATE POLICY "Teacher deletes own labels" ON diagnostic_labels
  FOR DELETE TO authenticated USING (owns_student(student_id));

CREATE POLICY "Teacher reads own audit" ON consent_audit_log
  FOR SELECT TO authenticated USING (owns_student(student_id));
CREATE POLICY "Teacher inserts own audit" ON consent_audit_log
  FOR INSERT TO authenticated WITH CHECK (owns_student(student_id));

CREATE POLICY "Teacher reads own video observations" ON video_observations
  FOR SELECT TO authenticated USING (owns_student(student_id));
CREATE POLICY "Teacher inserts own video observations" ON video_observations
  FOR INSERT TO authenticated WITH CHECK (owns_student(student_id));
CREATE POLICY "Teacher updates own video observations" ON video_observations
  FOR UPDATE TO authenticated USING (owns_student(student_id)) WITH CHECK (owns_student(student_id));
CREATE POLICY "Teacher deletes own video observations" ON video_observations
  FOR DELETE TO authenticated USING (owns_student(student_id));

-- 5. training_exports : journal réservé aux utilisateurs authentifiés
CREATE POLICY "Authenticated read exports" ON training_exports
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert exports" ON training_exports
  FOR INSERT TO authenticated WITH CHECK (true);

-- 6. Vérification : aucune policy publique ne doit subsister
SELECT tablename, policyname, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
