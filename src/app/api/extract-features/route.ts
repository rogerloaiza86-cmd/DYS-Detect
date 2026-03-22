import { NextResponse } from 'next/server';
import { extractTextFeatures, extractAudioFeatures, mergeFeatures, FeatureVector } from '@/lib/features';

/**
 * POST /api/extract-features
 *
 * Extracts objective, measurable variables from an analysis.
 * These features are independent of Claude's scoring — they are
 * purely algorithmic and can be correlated with confirmed diagnoses.
 */
export async function POST(request: Request) {
  try {
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

    if (!transcription) {
      return NextResponse.json({ error: 'Transcription requise' }, { status: 400 });
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
