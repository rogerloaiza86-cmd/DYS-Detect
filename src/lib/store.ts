import { supabase } from './supabase';
import { Student, AnalysisResult, RiskLevel, UserProfile, DiagnosticLabel } from './types';

// ─── Keys localStorage (profil uniquement) ────────────────────────────────
const PROFILE_KEY   = 'dys-detect-profile';
const ONBOARDED_KEY = 'dys-detect-onboarded';

// ─── Helpers: mapping Supabase row ↔ TypeScript ───────────────────────────
function toStudent(row: Record<string, unknown>): Student {
  return {
    id:               row.id as string,
    firstName:        row.first_name as string,
    lastName:         row.last_name as string,
    initials:         row.initials as string,
    grade:            row.grade as string,
    age:              row.age as number,
    lastAnalysisDate: row.last_analysis_date as string | null,
    riskLevel:        row.risk_level as RiskLevel,
    isUlisStudent:    (row.is_ulis_student as boolean) ?? false,
    consentStatus:    (row.consent_status as Student['consentStatus']) ?? 'pending',
    consentDate:      row.consent_date as string | null,
    consentGuardianName: row.consent_guardian_name as string | null,
  };
}

function toResult(row: Record<string, unknown>): AnalysisResult {
  return {
    id:               row.id as string,
    studentId:        row.student_id as string,
    date:             row.date as string,
    globalRiskLevel:  row.global_risk_level as RiskLevel,
    transcription:    row.transcription as string,
    markers:          row.markers as AnalysisResult['markers'],
    recommendations:  row.recommendations as string[],
    handwritingImage: row.handwriting_image as string | undefined,
    analysisMode:     (row.analysis_mode as AnalysisResult['analysisMode']) ?? 'dictee',
    referenceText:    row.reference_text as string | undefined,
    audioMetadata:    row.audio_metadata as AnalysisResult['audioMetadata'],
    disorderScreening: row.disorder_screening as AnalysisResult['disorderScreening'],
  };
}

function toLabel(row: Record<string, unknown>): DiagnosticLabel {
  return {
    id:            row.id as string,
    studentId:     row.student_id as string,
    disorder:      row.disorder as DiagnosticLabel['disorder'],
    subtype:       row.subtype as string | undefined,
    confirmedBy:   row.confirmed_by as string,
    confirmedDate: row.confirmed_date as string,
    severity:      row.severity as DiagnosticLabel['severity'],
    notes:         row.notes as string | undefined,
  };
}

// ─── Profile (localStorage) ───────────────────────────────────────────────

export function getProfile(): UserProfile {
  if (typeof window === 'undefined') return { firstName: '', lastName: '', role: '' };
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return { firstName: '', lastName: '', role: '' };
  return JSON.parse(raw);
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

// ─── Onboarding ───────────────────────────────────────────────────────────

export function hasCompletedOnboarding(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(ONBOARDED_KEY) === 'true';
}

export function completeOnboarding(profile: UserProfile): void {
  saveProfile(profile);
  localStorage.setItem(ONBOARDED_KEY, 'true');
}

// ─── Students (Supabase) ──────────────────────────────────────────────────

export async function getStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error('getStudents:', error); return []; }
  return (data ?? []).map(toStudent);
}

export async function getStudentById(id: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return toStudent(data);
}

export async function saveStudent(student: Student): Promise<void> {
  const row: Record<string, unknown> = {
    id:                 student.id,
    first_name:         student.firstName,
    last_name:          student.lastName,
    initials:           student.initials,
    grade:              student.grade,
    age:                student.age,
    last_analysis_date: student.lastAnalysisDate,
    risk_level:         student.riskLevel,
  };
  // Include ULIS fields only if defined (backward compat with migration v1)
  if (student.isUlisStudent !== undefined) row.is_ulis_student = student.isUlisStudent;
  if (student.consentStatus !== undefined) row.consent_status = student.consentStatus;
  if (student.consentDate !== undefined)   row.consent_date = student.consentDate;
  if (student.consentGuardianName !== undefined) row.consent_guardian_name = student.consentGuardianName;

  const { error } = await supabase.from('students').upsert(row);
  if (error) console.error('saveStudent:', error);
}

export async function deleteStudent(id: string): Promise<void> {
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) console.error('deleteStudent:', error);
}

export async function createStudent(
  firstName: string,
  lastName: string,
  grade: string,
  age: number,
): Promise<Student> {
  const student: Student = {
    id:               `s-${Date.now()}`,
    firstName,
    lastName,
    initials:         (firstName[0] + lastName[0]).toUpperCase(),
    grade,
    age,
    lastAnalysisDate: null,
    riskLevel:        'Non identifié',
  };
  await saveStudent(student);
  return student;
}

// ─── Analysis Results (Supabase) ──────────────────────────────────────────

export async function getResults(): Promise<AnalysisResult[]> {
  const { data, error } = await supabase
    .from('analysis_results')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error('getResults:', error); return []; }
  return (data ?? []).map(toResult);
}

export async function getResultById(id: string): Promise<AnalysisResult | null> {
  const { data, error } = await supabase
    .from('analysis_results')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return toResult(data);
}

export async function getResultsByStudent(studentId: string): Promise<AnalysisResult[]> {
  const { data, error } = await supabase
    .from('analysis_results')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: true });
  if (error) { console.error('getResultsByStudent:', error); return []; }
  return (data ?? []).map(toResult);
}

export async function deleteResult(id: string): Promise<void> {
  const { error } = await supabase.from('analysis_results').delete().eq('id', id);
  if (error) console.error('deleteResult:', error);
}

export async function saveResult(result: AnalysisResult): Promise<void> {
  const row: Record<string, unknown> = {
    id:                result.id,
    student_id:        result.studentId,
    date:              result.date,
    global_risk_level: result.globalRiskLevel,
    transcription:     result.transcription,
    markers:           result.markers,
    recommendations:   result.recommendations,
    handwriting_image: result.handwritingImage ?? null,
  };
  // V2 fields (only if defined, backward compat)
  if (result.analysisMode)       row.analysis_mode = result.analysisMode;
  if (result.referenceText)      row.reference_text = result.referenceText;
  if (result.audioMetadata)      row.audio_metadata = result.audioMetadata;
  if (result.disorderScreening)  row.disorder_screening = result.disorderScreening;

  const { error } = await supabase.from('analysis_results').upsert(row);
  if (error) { console.error('saveResult:', error); return; }

  // Update student's risk level + last analysis date
  const student = await getStudentById(result.studentId);
  if (student) {
    await saveStudent({
      ...student,
      lastAnalysisDate: new Date(result.date).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric',
      }),
      riskLevel: result.globalRiskLevel,
    });
  }
}

// ─── Diagnostic Labels (Supabase) ────────────────────────────────────────

export async function getDiagnosticLabels(studentId: string): Promise<DiagnosticLabel[]> {
  const { data, error } = await supabase
    .from('diagnostic_labels')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: true });
  if (error) { console.error('getDiagnosticLabels:', error); return []; }
  return (data ?? []).map(toLabel);
}

export async function addDiagnosticLabel(label: DiagnosticLabel): Promise<void> {
  const row = {
    id:             label.id,
    student_id:     label.studentId,
    disorder:       label.disorder,
    subtype:        label.subtype ?? null,
    confirmed_by:   label.confirmedBy,
    confirmed_date: label.confirmedDate,
    severity:       label.severity ?? null,
    notes:          label.notes ?? null,
  };
  const { error } = await supabase.from('diagnostic_labels').insert(row);
  if (error) console.error('addDiagnosticLabel:', error);
}

export async function removeDiagnosticLabel(id: string): Promise<void> {
  const { error } = await supabase.from('diagnostic_labels').delete().eq('id', id);
  if (error) console.error('removeDiagnosticLabel:', error);
}

// ─── Consent Audit (Supabase) ────────────────────────────────────────────

export async function logConsentAction(
  studentId: string,
  action: 'consent_given' | 'consent_withdrawn' | 'data_exported' | 'data_deleted',
  performedBy: string,
  details?: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase.from('consent_audit_log').insert({
    id: `audit-${Date.now()}`,
    student_id: studentId,
    action,
    performed_by: performedBy,
    details: details ?? null,
  });
  if (error) console.error('logConsentAction:', error);
}

export async function updateStudentConsent(
  studentId: string,
  status: 'signed' | 'refused',
  guardianName: string,
  performedBy: string,
): Promise<void> {
  const student = await getStudentById(studentId);
  if (!student) return;

  await saveStudent({
    ...student,
    consentStatus: status,
    consentDate: new Date().toISOString(),
    consentGuardianName: guardianName,
  });

  await logConsentAction(studentId, status === 'signed' ? 'consent_given' : 'consent_withdrawn', performedBy, {
    guardianName,
  });
}
