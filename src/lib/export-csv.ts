import { Student, AnalysisResult } from './types';

/**
 * Génère un CSV des analyses pour la recherche et déclenche le téléchargement.
 * Colonnes normalisées incluant les scores par sous-catégorie et les métadonnées audio.
 */
export function exportAnalysesCSV(results: AnalysisResult[], students: Student[]): void {
  const studentMap = new Map<string, Student>(students.map(s => [s.id, s]));

  const headers = [
    'id',
    'student_id',
    'student_name',
    'grade',
    'age',
    'date',
    'analysis_mode',
    'global_risk_level',
    'DYS_score',
    'TDAH_score',
    'TSA_score',
    'TDAH_emotionnel_score',
    'TDAH_impulsif_score',
    'TDAH_inattentif_score',
    'TSA_prosodie_score',
    'TSA_pragmatique_score',
    'DYS_phonologie_score',
    'DYS_orthographe_score',
    'words_per_minute',
    'pause_count',
    'silence_ratio',
    'pitch_variance',
  ];

  const escapeCell = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // Wrap in quotes if contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const avgScoreByCategory = (result: AnalysisResult, category: string): number | null => {
    const scores = (result.markers || [])
      .filter(m => m.category === category)
      .map(m => m.score);
    if (scores.length === 0) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const scoreBySubcategory = (result: AnalysisResult, category: string, subcategory: string): number | null => {
    const marker = (result.markers || []).find(
      m => m.category === category && m.subcategory === subcategory,
    );
    return marker ? marker.score : null;
  };

  const rows: string[] = [headers.join(',')];

  for (const result of results) {
    const student = studentMap.get(result.studentId);
    const studentName = student
      ? `${student.firstName} ${student.lastName}`
      : result.studentId;

    const pitchVarianceMap: Record<string, string> = {
      low: 'monotone',
      normal: 'normal',
      high: 'variable',
    };

    const row = [
      result.id,
      result.studentId,
      studentName,
      student?.grade ?? '',
      student?.age ?? '',
      result.date,
      result.analysisMode ?? '',
      result.globalRiskLevel,
      avgScoreByCategory(result, 'DYS'),
      avgScoreByCategory(result, 'TDAH'),
      avgScoreByCategory(result, 'TSA'),
      scoreBySubcategory(result, 'TDAH', 'emotionnel'),
      scoreBySubcategory(result, 'TDAH', 'impulsif'),
      scoreBySubcategory(result, 'TDAH', 'inattentif'),
      scoreBySubcategory(result, 'TSA', 'prosodie'),
      scoreBySubcategory(result, 'TSA', 'pragmatique'),
      scoreBySubcategory(result, 'DYS', 'phonologie'),
      scoreBySubcategory(result, 'DYS', 'orthographe'),
      result.audioMetadata?.wordsPerMinute ?? null,
      result.audioMetadata?.pauseCount ?? null,
      result.audioMetadata?.silenceRatio ?? null,
      result.audioMetadata?.pitchVariance
        ? pitchVarianceMap[result.audioMetadata.pitchVariance] ?? result.audioMetadata.pitchVariance
        : null,
    ].map(escapeCell);

    rows.push(row.join(','));
  }

  const csvContent = rows.join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateSlug = new Date().toISOString().slice(0, 10);
  a.download = `DYS-Detect_analyses_recherche_${dateSlug}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
