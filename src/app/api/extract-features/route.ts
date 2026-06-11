import { NextResponse } from 'next/server';
import { extractTextFeatures, extractAudioFeatures, mergeFeatures, FeatureVector } from '@/lib/features';
import { requireUser, unauthorized } from '@/lib/api-auth';
import { checkRoute, rateLimited } from '@/lib/rate-limit';

const MAX_TRANSCRIPTION_CHARS = 20_000;

/**
 * POST /api/extract-features
 *
 * Extracts objective, measurable variables from an analysis.
 * These features are independent of Claude's scoring — they are
 * purely algorithmic and can be correlated with confirmed diagnoses.
 */
export async function POST(request: Request) {
  try {
    if (!checkRoute(request, 'extract-features', 30)) return rateLimited();
    if (!(await requireUser(request))) return unauthorized();

    const body = await request.json();
    const {
      transcription,
      referenceText,
      audioMetadata,
      studentId,
      analysisId,
      analysisMode = 'dictee',
      studentAge = 10,
      date = new Date().toISOString(),
      // Graphomotor features are passed directly (from Claude's image analysis)
      graphomotorFeatures,
    } = body;

    if (!transcription || typeof transcription !== 'string') {
      return NextResponse.json({ error: 'Transcription requise' }, { status: 400 });
    }
    if (transcription.length > MAX_TRANSCRIPTION_CHARS) {
      return NextResponse.json({ error: 'Transcription trop longue (20 000 caractères max)' }, { status: 413 });
    }

    // 1. Text features (algorithmic, no AI)
    const textFeatures = extractTextFeatures(transcription, referenceText || undefined);

    // 2. Audio features (from pre-extracted metadata)
    const audioFeatures = audioMetadata ? extractAudioFeatures(audioMetadata) : {};

    // 3. Graphomotor features (passed from Claude's image analysis)
    const graphoFeatures: Partial<FeatureVector> = graphomotorFeatures || {};

    // 4. Merge all
    const vector = mergeFeatures(
      { studentId, analysisId, analysisMode, studentAge, date },
      textFeatures,
      audioFeatures,
      graphoFeatures,
    );

    return NextResponse.json(vector);

  } catch (error) {
    console.error('Erreur extraction features:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
