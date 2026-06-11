import { describe, it, expect } from 'vitest';
import { buildAnalysisPrompt } from '../prompts/builder';

const TRANSCRIPTION = 'Le petit chaperon rouge marche dans la forêt.';

describe('buildAnalysisPrompt', () => {
  it('inclut la transcription et le contexte d’âge', () => {
    const prompt = buildAnalysisPrompt({
      mode: 'dictee',
      transcription: TRANSCRIPTION,
      referenceText: 'Le petit chaperon rouge marche dans la forêt.',
      hasImage: false,
      studentAge: 8,
    });
    expect(prompt).toContain(TRANSCRIPTION);
    expect(prompt).toContain('8 ans');
  });

  it('exige une réponse JSON structurée', () => {
    const prompt = buildAnalysisPrompt({
      mode: 'dictee',
      transcription: TRANSCRIPTION,
      hasImage: false,
    });
    expect(prompt).toMatch(/JSON/i);
    expect(prompt).toMatch(/globalRiskLevel/);
  });

  it('injecte les métadonnées audio quand elles sont fournies', () => {
    const prompt = buildAnalysisPrompt({
      mode: 'lecture_libre',
      transcription: TRANSCRIPTION,
      hasImage: false,
      audioMetadata: {
        totalDurationMs: 45000,
        pauseCount: 8,
        averagePauseDurationMs: 1200,
        maxPauseDurationMs: 3500,
        wordsPerMinute: 85,
        silenceRatio: 0.25,
        pitchVariance: 'low',
        rhythmRegularity: 'regular',
        speechRate: 'normal',
      },
    });
    expect(prompt).toContain('85');
    expect(prompt).toMatch(/pause/i);
  });

  it('injecte les profils de référence quand ils sont fournis', () => {
    const prompt = buildAnalysisPrompt({
      mode: 'dictee',
      transcription: TRANSCRIPTION,
      hasImage: false,
      referenceProfilesText: '## Profils de référence (test sentinel)',
    });
    expect(prompt).toContain('test sentinel');
  });
});
