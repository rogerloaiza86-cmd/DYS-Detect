import { NextResponse } from 'next/server';
import { VideoMetadata } from '@/lib/types';

/**
 * POST /api/extract-video-features
 *
 * Phase 3 feature — Video behavioral feature extraction.
 *
 * Future integration: MediaPipe Holistic will be used to extract real-time
 * pose, face mesh, and hand landmarks from video frames. The pipeline will:
 *   1. Accept a video blob (webm/mp4) from the client
 *   2. Process frames through MediaPipe Holistic (face mesh for gaze/blink,
 *      pose for body rocking/posture, hands for fidgeting/stereotypies)
 *   3. Aggregate per-frame landmarks into session-level behavioral metrics
 *   4. Return structured VideoMetadata
 *
 * For now, returns mock data to allow front-end integration and testing.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const videoContent = formData.get('video') as Blob | null;

    if (!videoContent) {
      return NextResponse.json(
        { error: 'Aucun fichier vidéo fourni' },
        { status: 400 },
      );
    }

    // TODO: Integrate MediaPipe Holistic for real computer-vision extraction.
    // For now, return structured mock data representative of a typical session.
    const mockMetadata: VideoMetadata = {
      totalDurationMs: 60000,
      // Gaze & attention
      gazeContactRatio: 0.55,
      gazeAvertedDurationMs: 27000,
      saccadeCount: 12,
      // Facial expression
      blinkRate: 18,
      facialExpressionVariability: 'normal',
      emotionalCongruence: 'congruent',
      smileFrequency: 3.2,
      // Motor behavior
      headMovementIndex: 35,
      handFidgetingScore: 25,
      postureChangeFrequency: 1.5,
      bodyRockingEvents: 0,
      // Stereotypies & repetitive behaviors
      stereotypyEvents: 0,
      selfStimulationScore: 10,
      // Interaction & synchrony
      responseLatencyMs: 1200,
      conversationalSynchrony: 'good',
      turnTakingAppropriateness: 'appropriate',
    };

    return NextResponse.json<VideoMetadata>(mockMetadata);
  } catch (error) {
    console.error('Erreur extraction vidéo:', error);
    return NextResponse.json(
      { error: 'Erreur interne extraction vidéo' },
      { status: 500 },
    );
  }
}
