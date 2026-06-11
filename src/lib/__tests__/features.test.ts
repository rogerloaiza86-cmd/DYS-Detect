import { describe, it, expect } from 'vitest';
import { extractTextFeatures, extractAudioFeatures, mergeFeatures } from '../features';

describe('extractTextFeatures', () => {
  it('compte les mots et le ratio type/token', () => {
    const f = extractTextFeatures('le chat mange la souris');
    expect(f.totalWordCount).toBe(5);
    expect(f.typeTokenRatio).toBe(1); // tous les mots sont uniques
  });

  it('détecte les répétitions consécutives de mots pleins', () => {
    const f = extractTextFeatures('le loup loup arrive vite vite');
    expect(f.repetitionCount).toBeGreaterThanOrEqual(2);
  });

  it('retourne un texte vide sans erreur', () => {
    const f = extractTextFeatures('');
    expect(f.totalWordCount).toBe(0);
    expect(f.typeTokenRatio).toBe(0);
  });

  it('calcule une précision parfaite quand la transcription égale la référence', () => {
    const texte = 'le petit chaperon rouge marche dans la forêt';
    const f = extractTextFeatures(texte, texte);
    expect(f.wordAccuracyRate).toBe(1);
    expect(f.normalizedLevenshtein).toBe(0);
  });

  it('dégrade la précision quand la transcription diverge de la référence', () => {
    const ref = 'le petit chaperon rouge marche dans la forêt';
    const f = extractTextFeatures('le peti chaperon ruge marché dan la faurê', ref);
    expect(f.wordAccuracyRate).toBeLessThan(1);
    expect(f.normalizedLevenshtein).toBeGreaterThan(0);
  });
});

describe('extractAudioFeatures', () => {
  const base = {
    totalDurationMs: 45000,
    pauseCount: 8,
    averagePauseDurationMs: 1200,
    maxPauseDurationMs: 3500,
    wordsPerMinute: 85,
    silenceRatio: 0.25,
    pitchVariance: 'low',
    rhythmRegularity: 'very_irregular',
    speechRate: 'fast',
  };

  it('mappe les métadonnées audio vers le vecteur de features', () => {
    const f = extractAudioFeatures(base);
    expect(f.wordsPerMinute).toBe(85);
    expect(f.pauseCount).toBe(8);
    expect(f.silenceRatio).toBe(0.25);
  });

  it('convertit les catégories qualitatives en scores 0-1', () => {
    const f = extractAudioFeatures(base);
    expect(f.pitchVarianceScore).toBe(0.2);        // low
    expect(f.rhythmIrregularityScore).toBe(0.8);   // very_irregular
    expect(f.speechRateScore).toBe(0.8);           // fast
  });
});

describe('mergeFeatures', () => {
  const base = {
    studentId: 's-1',
    analysisId: 'res-1',
    analysisMode: 'dictee',
    studentAge: 9,
    date: '2026-06-11',
  };

  it('initialise toutes les variables non fournies à null', () => {
    const v = mergeFeatures(base);
    expect(v.studentId).toBe('s-1');
    expect(v.wordAccuracyRate).toBeNull();
    expect(v.gazeContactRatio).toBeNull();
  });

  it('fusionne plusieurs vecteurs partiels, le dernier non-null gagne', () => {
    const v = mergeFeatures(base, { totalWordCount: 12 }, { pauseCount: 4 });
    expect(v.totalWordCount).toBe(12);
    expect(v.pauseCount).toBe(4);
    expect(v.studentAge).toBe(9);
  });
});
