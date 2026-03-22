import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { extractTextFeatures, extractAudioFeatures, mergeFeatures } from '@/lib/features';

/**
 * GET /api/export-training-data?format=jsonl|csv
 *
 * Exports labeled training data by joining analysis results with
 * confirmed diagnostic labels. Only exports data from students
 * with consent_status = 'signed'.
 *
 * Output: Each row = one analysis with:
 *  - All extracted features (objective variables)
 *  - Confirmed diagnoses (labels from professionals)
 *  - Student metadata (age, grade — no names, pseudonymized IDs)
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'jsonl';

    // 1. Get all students with signed consent
    const { data: students, error: stuErr } = await supabase
      .from('students')
      .select('*')
      .eq('consent_status', 'signed');

    if (stuErr || !students?.length) {
      return NextResponse.json({ error: 'Aucun élève avec consentement signé' }, { status: 404 });
    }

    const studentIds = students.map((s: Record<string, unknown>) => s.id as string);

    // 2. Get all results for these students
    const { data: results, error: resErr } = await supabase
      .from('analysis_results')
      .select('*')
      .in('student_id', studentIds);

    if (resErr || !results?.length) {
      return NextResponse.json({ error: 'Aucune analyse trouvée' }, { status: 404 });
    }

    // 3. Get all diagnostic labels
    const { data: labels, error: lblErr } = await supabase
      .from('diagnostic_labels')
      .select('*')
      .in('student_id', studentIds);

    if (lblErr) {
      console.error('Error fetching labels:', lblErr);
    }

    // 4. Build training records
    const records: Record<string, unknown>[] = [];
    let pseudoCounter = 1;
    const pseudoMap = new Map<string, string>();

    for (const result of results) {
      const student = students.find((s: Record<string, unknown>) => s.id === result.student_id);
      if (!student) continue;

      // Pseudonymize student ID
      if (!pseudoMap.has(result.student_id as string)) {
        pseudoMap.set(result.student_id as string, `P${String(pseudoCounter++).padStart(3, '0')}`);
      }
      const pseudoId = pseudoMap.get(result.student_id as string)!;

      // Extract features
      const textFeatures = extractTextFeatures(
        result.transcription as string,
        (result.reference_text as string) || undefined,
      );
      const audioFeatures = result.audio_metadata
        ? extractAudioFeatures(result.audio_metadata as Parameters<typeof extractAudioFeatures>[0])
        : {};

      const features = mergeFeatures(
        {
          studentId: pseudoId,
          analysisId: result.id as string,
          analysisMode: (result.analysis_mode as string) || 'dictee',
          studentAge: student.age as number,
          date: result.date as string,
        },
        textFeatures,
        audioFeatures,
      );

      // Get labels for this student
      const studentLabels = (labels || [])
        .filter((l: Record<string, unknown>) => l.student_id === result.student_id)
        .map((l: Record<string, unknown>) => ({
          disorder: l.disorder,
          subtype: l.subtype,
          severity: l.severity,
          confirmedBy: l.confirmed_by,
        }));

      records.push({
        ...features,
        studentId: pseudoId, // Override with pseudonymized ID
        grade: student.grade,
        confirmedDiagnoses: studentLabels,
        hasDYS: studentLabels.some((l: Record<string, unknown>) => l.disorder === 'DYS'),
        hasTDAH: studentLabels.some((l: Record<string, unknown>) => l.disorder === 'TDAH'),
        hasTSA: studentLabels.some((l: Record<string, unknown>) => l.disorder === 'TSA'),
        aiRiskLevel: result.global_risk_level,
        aiDisorderScreening: result.disorder_screening,
      });
    }

    // 5. Format output
    if (format === 'csv') {
      const allKeys = Object.keys(records[0] || {}).filter(k => k !== 'confirmedDiagnoses' && k !== 'aiDisorderScreening');
      const header = allKeys.join(',');
      const rows = records.map(r => allKeys.map(k => {
        const val = r[k];
        if (val === null || val === undefined) return '';
        if (typeof val === 'boolean') return val ? '1' : '0';
        if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
        return String(val);
      }).join(','));
      const csv = [header, ...rows].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="dys-detect-training-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    // JSONL format
    const jsonl = records.map(r => JSON.stringify(r)).join('\n');
    return new NextResponse(jsonl, {
      headers: {
        'Content-Type': 'application/jsonl; charset=utf-8',
        'Content-Disposition': `attachment; filename="dys-detect-training-${new Date().toISOString().slice(0, 10)}.jsonl"`,
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
