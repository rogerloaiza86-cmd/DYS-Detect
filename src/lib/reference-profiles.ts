/**
 * ═══════════════════════════════════════════════════════════════════════
 * DYS-Detect — Reference Profiles System
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Computes average feature profiles from labeled ULIS students.
 * These profiles are injected into Claude's analysis prompt so that
 * the AI compares new students against REAL data from YOUR students.
 *
 * This is the "poor man's fine-tuning" — no training needed, but the
 * AI gets better as you add more labeled data.
 */

import { supabase } from './supabase';
import { extractTextFeatures, extractAudioFeatures, FeatureVector, FEATURE_LABELS } from './features';

export interface ReferenceProfile {
  disorder: string;     // 'DYS', 'TDAH', 'TSA', 'Sain'
  sampleCount: number;
  averages: Record<string, number | null>;
  // For key discriminating features, also store min/max/stddev
  keyFeatures: {
    name: string;
    avg: number;
    min: number;
    max: number;
    stddev: number;
  }[];
}

/**
 * Compute reference profiles from all labeled analyses in Supabase.
 * Returns one profile per disorder group + one for "Sain" (no diagnosis).
 */
export async function computeReferenceProfiles(): Promise<ReferenceProfile[]> {
  // 1. Get all students
  const { data: students } = await supabase.from('students').select('*');
  if (!students?.length) return [];

  // 2. Get all diagnostic labels
  const { data: labels } = await supabase.from('diagnostic_labels').select('*');

  // 3. Get all analysis results
  const { data: results } = await supabase.from('analysis_results').select('*');
  if (!results?.length) return [];

  // 4. Map student ID → disorders
  const studentDisorders = new Map<string, string[]>();
  for (const s of students) {
    const sLabels = (labels || []).filter((l: Record<string, unknown>) => l.student_id === s.id);
    if (sLabels.length > 0) {
      studentDisorders.set(s.id as string, sLabels.map((l: Record<string, unknown>) => l.disorder as string));
    }
  }

  // 5. Extract features for each result and group by disorder
  const groups: Record<string, Partial<FeatureVector>[]> = {
    DYS: [], TDAH: [], TSA: [], Sain: [],
  };

  for (const r of results) {
    const studentId = r.student_id as string;
    const student = students.find((s: Record<string, unknown>) => s.id === studentId);
    if (!student) continue;

    const textF = extractTextFeatures(
      r.transcription as string,
      (r.reference_text as string) || undefined,
    );
    const audioF = r.audio_metadata
      ? extractAudioFeatures(r.audio_metadata as Parameters<typeof extractAudioFeatures>[0])
      : {};

    const features = { ...textF, ...audioF };
    const disorders = studentDisorders.get(studentId);

    if (!disorders || disorders.length === 0) {
      groups['Sain'].push(features);
    } else {
      for (const d of disorders) {
        if (!groups[d]) groups[d] = [];
        groups[d].push(features);
      }
    }
  }

  // 6. Compute averages per group
  const featureKeys = Object.keys(FEATURE_LABELS) as (keyof typeof FEATURE_LABELS)[];
  const profiles: ReferenceProfile[] = [];

  for (const [disorder, vectors] of Object.entries(groups)) {
    if (vectors.length === 0) continue;

    const averages: Record<string, number | null> = {};
    const keyFeatures: ReferenceProfile['keyFeatures'] = [];

    for (const key of featureKeys) {
      const values = vectors
        .map(v => (v as Record<string, unknown>)[key])
        .filter((v): v is number => v !== null && v !== undefined && typeof v === 'number');

      if (values.length === 0) {
        averages[key] = null;
        continue;
      }

      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const variance = values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length;
      const stddev = Math.sqrt(variance);

      averages[key] = Math.round(avg * 1000) / 1000;

      // Track as key feature if it has meaningful data
      if (values.length >= 2) {
        keyFeatures.push({
          name: key,
          avg: Math.round(avg * 1000) / 1000,
          min: Math.round(min * 1000) / 1000,
          max: Math.round(max * 1000) / 1000,
          stddev: Math.round(stddev * 1000) / 1000,
        });
      }
    }

    // Sort key features by discriminating power (highest stddev relative to mean)
    keyFeatures.sort((a, b) => {
      const cvA = a.avg !== 0 ? a.stddev / Math.abs(a.avg) : 0;
      const cvB = b.avg !== 0 ? b.stddev / Math.abs(b.avg) : 0;
      return cvA - cvB; // Lower CV = more consistent = more discriminating
    });

    profiles.push({
      disorder,
      sampleCount: vectors.length,
      averages,
      keyFeatures: keyFeatures.slice(0, 10), // Top 10 most consistent features
    });
  }

  return profiles;
}

/**
 * Format reference profiles into a text block for Claude's prompt.
 * This is the key function that makes Claude "learn" from your data.
 */
export function formatProfilesForPrompt(profiles: ReferenceProfile[]): string {
  if (profiles.length === 0) return '';

  const totalSamples = profiles.reduce((s, p) => s + p.sampleCount, 0);

  let text = `\n## Profils de référence (basés sur ${totalSamples} analyses d'élèves réels)\n\n`;
  text += `Ces profils ont été calculés à partir d'analyses d'élèves avec diagnostics confirmés par des professionnels. Utilise-les comme référentiel de comparaison.\n\n`;

  for (const profile of profiles) {
    text += `### Profil ${profile.disorder} (${profile.sampleCount} analyses)\n`;
    text += `Variables discriminantes (les plus fiables pour ce trouble) :\n`;

    for (const feat of profile.keyFeatures.slice(0, 8)) {
      const meta = FEATURE_LABELS[feat.name as keyof typeof FEATURE_LABELS];
      if (!meta) continue;

      text += `- **${meta.label}** : moyenne = ${feat.avg}${meta.unit !== 'n' ? ` ${meta.unit}` : ''} (min: ${feat.min}, max: ${feat.max})\n`;
    }
    text += '\n';
  }

  text += `Compare les variables extraites de cet élève avec ces profils. Indique le profil le plus proche et le degré de confiance.\n`;

  return text;
}

/**
 * Cache the profiles in memory to avoid recomputing on every analysis.
 * Refreshed every 10 minutes or on demand.
 */
let cachedProfiles: ReferenceProfile[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function getReferenceProfiles(): Promise<ReferenceProfile[]> {
  const now = Date.now();
  if (cachedProfiles && now - cacheTimestamp < CACHE_TTL) {
    return cachedProfiles;
  }

  cachedProfiles = await computeReferenceProfiles();
  cacheTimestamp = now;
  return cachedProfiles;
}

export function invalidateProfileCache(): void {
  cachedProfiles = null;
  cacheTimestamp = 0;
}
