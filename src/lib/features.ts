/**
 * ═══════════════════════════════════════════════════════════════════════
 * DYS-Detect — Feature Vector Extraction
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Extracts OBJECTIVE, MEASURABLE variables from text, audio, and images.
 * These features are designed to be correlated with confirmed diagnoses
 * from ULIS students to build a data-driven screening model.
 *
 * Each variable is a number (0-1 normalized or raw count) that can be
 * statistically analyzed independently of Claude's subjective scoring.
 */

// ─── Feature Vector Type ─────────────────────────────────────────────────

export interface FeatureVector {
  // Metadata
  studentId: string;
  analysisId: string;
  analysisMode: string;
  studentAge: number;
  date: string;

  // ═══ TEXT COMPARISON FEATURES (dictée/lecture) ═══════════════════════
  // Requires referenceText + transcription

  /** Taux de mots corrects (mots identiques / mots totaux référence) */
  wordAccuracyRate: number | null;

  /** Nombre d'erreurs de substitution phonémique (b/d, p/b, ch/s, f/v, t/d) */
  phonemeSubstitutionCount: number | null;

  /** Nombre d'omissions de phonèmes ou lettres */
  omissionCount: number | null;

  /** Nombre d'inversions (métathèses : "cra" → "car") */
  inversionCount: number | null;

  /** Nombre d'ajouts de phonèmes non présents dans le référentiel */
  additionCount: number | null;

  /** Nombre d'erreurs de segmentation (mots fusionnés ou découpés) */
  segmentationErrorCount: number | null;

  /** Distance de Levenshtein normalisée (0 = identique, 1 = totalement différent) */
  normalizedLevenshtein: number | null;

  // ═══ MORPHOSYNTAX FEATURES ══════════════════════════════════════════

  /** Nombre d'erreurs d'accord (genre, nombre, sujet-verbe) */
  agreementErrorCount: number | null;

  /** Nombre d'erreurs de conjugaison */
  conjugationErrorCount: number | null;

  /** Longueur moyenne des énoncés en mots (MLU - Mean Length of Utterance) */
  meanUtteranceLength: number | null;

  // ═══ LEXICAL FEATURES ══════════════════════════════════════════════

  /** Type-Token Ratio : mots uniques / mots totaux (diversité lexicale) */
  typeTokenRatio: number | null;

  /** Nombre total de mots produits */
  totalWordCount: number | null;

  /** Nombre de connecteurs de discours (donc, alors, parce que, du coup, mais, et puis) */
  discourseConnectorCount: number | null;

  /** Ratio de mots fonctionnels (articles, pronoms, prépositions) / mots totaux */
  functionWordRatio: number | null;

  /** Nombre de mots "euh", "hm", "ben" (fillers / hésitations lexicales) */
  fillerWordCount: number | null;

  /** Nombre de répétitions de mots ou groupes de mots */
  repetitionCount: number | null;

  // ═══ PRAGMATIC FEATURES (expression libre / conversation) ═══════════

  /** Nombre de changements de sujet non motivés */
  topicShiftCount: number | null;

  /** Nombre de phrases inachevées ou abandonnées */
  unfinishedSentenceCount: number | null;

  /** Nombre d'auto-corrections ("non en fait", "enfin", "je veux dire") */
  selfCorrectionCount: number | null;

  /** Score de persévération : répétitions du même thème / sujet restreint */
  perseverationScore: number | null;

  /** Nombre de réponses hors contexte (conversation guidée) */
  offTopicResponseCount: number | null;

  /** Ratio de réponses minimales (≤3 mots) en conversation guidée */
  minimalResponseRatio: number | null;

  // ═══ AUDIO / TEMPORAL FEATURES ═════════════════════════════════════

  /** Mots par minute */
  wordsPerMinute: number | null;

  /** Nombre de pauses (>500ms) */
  pauseCount: number | null;

  /** Durée moyenne des pauses (ms) */
  avgPauseDurationMs: number | null;

  /** Durée de la plus longue pause (ms) */
  maxPauseDurationMs: number | null;

  /** Ratio silence / durée totale (0-1) */
  silenceRatio: number | null;

  /** Variance du pitch (0=monotone, 1=très variable) */
  pitchVarianceScore: number | null;

  /** Régularité du rythme (0=très régulier/mécanique, 1=très irrégulier) */
  rhythmIrregularityScore: number | null;

  /** Vitesse de parole (0=lent, 0.5=normal, 1=rapide) */
  speechRateScore: number | null;

  /** Dégradation progressive : ratio d'erreurs 2e moitié / 1e moitié */
  degradationRatio: number | null;

  // ═══ GRAPHOMOTOR FEATURES (from handwriting image) ══════════════════

  /** Score d'irrégularité des lettres (0-1) */
  letterIrregularityScore: number | null;

  /** Score d'adhérence aux lignes (0=hors lignes, 1=parfait) */
  lineAdherenceScore: number | null;

  /** Nombre de ratures visibles */
  crossingOutCount: number | null;

  /** Score de lisibilité globale (0=illisible, 1=parfait) */
  legibilityScore: number | null;

  /** Score de pression estimée (0=très léger, 1=très appuyé/variable) */
  pressureScore: number | null;
}

// ─── Feature Labels (for display) ────────────────────────────────────────

export const FEATURE_LABELS: Record<keyof Omit<FeatureVector, 'studentId' | 'analysisId' | 'analysisMode' | 'studentAge' | 'date'>, {
  label: string;
  category: 'Phonologie' | 'Morphosyntaxe' | 'Lexique' | 'Pragmatique' | 'Audio' | 'Graphomoteur';
  unit: string;
  relevantFor: ('DYS' | 'TDAH' | 'TSA')[];
  description: string;
}> = {
  wordAccuracyRate:         { label: 'Taux de mots corrects',        category: 'Phonologie',    unit: '%',    relevantFor: ['DYS'],          description: 'Proportion de mots identiques au référentiel' },
  phonemeSubstitutionCount: { label: 'Substitutions phonémiques',    category: 'Phonologie',    unit: 'n',    relevantFor: ['DYS'],          description: 'Nombre de substitutions de sons proches (b/d, p/b, ch/s)' },
  omissionCount:            { label: 'Omissions',                    category: 'Phonologie',    unit: 'n',    relevantFor: ['DYS'],          description: 'Phonèmes ou lettres omis' },
  inversionCount:           { label: 'Inversions (métathèses)',      category: 'Phonologie',    unit: 'n',    relevantFor: ['DYS'],          description: 'Inversions de phonèmes ou syllabes' },
  additionCount:            { label: 'Ajouts',                       category: 'Phonologie',    unit: 'n',    relevantFor: ['DYS'],          description: 'Phonèmes ajoutés absents du référentiel' },
  segmentationErrorCount:   { label: 'Erreurs de segmentation',      category: 'Phonologie',    unit: 'n',    relevantFor: ['DYS'],          description: 'Mots fusionnés ou découpés incorrectement' },
  normalizedLevenshtein:    { label: 'Distance de Levenshtein',      category: 'Phonologie',    unit: '0-1',  relevantFor: ['DYS'],          description: 'Distance d\'édition normalisée entre référence et transcription' },
  agreementErrorCount:      { label: 'Erreurs d\'accord',            category: 'Morphosyntaxe', unit: 'n',    relevantFor: ['DYS'],          description: 'Erreurs de genre, nombre, accord sujet-verbe' },
  conjugationErrorCount:    { label: 'Erreurs de conjugaison',       category: 'Morphosyntaxe', unit: 'n',    relevantFor: ['DYS'],          description: 'Temps verbaux incorrects' },
  meanUtteranceLength:      { label: 'Longueur moyenne des énoncés', category: 'Morphosyntaxe', unit: 'mots', relevantFor: ['DYS', 'TSA'],   description: 'MLU : nombre moyen de mots par phrase' },
  typeTokenRatio:           { label: 'Diversité lexicale (TTR)',     category: 'Lexique',       unit: '0-1',  relevantFor: ['TSA'],          description: 'Ratio mots uniques / mots totaux' },
  totalWordCount:           { label: 'Nombre total de mots',         category: 'Lexique',       unit: 'n',    relevantFor: ['TDAH', 'TSA'],  description: 'Production verbale totale' },
  discourseConnectorCount:  { label: 'Connecteurs de discours',      category: 'Lexique',       unit: 'n',    relevantFor: ['TSA'],          description: 'Nombre de donc, alors, parce que, du coup...' },
  functionWordRatio:        { label: 'Ratio mots fonctionnels',      category: 'Lexique',       unit: '0-1',  relevantFor: ['DYS', 'TSA'],   description: 'Proportion d\'articles, pronoms, prépositions' },
  fillerWordCount:          { label: 'Mots de remplissage',          category: 'Lexique',       unit: 'n',    relevantFor: ['TDAH'],         description: 'Nombre de "euh", "hm", "ben"' },
  repetitionCount:          { label: 'Répétitions',                  category: 'Lexique',       unit: 'n',    relevantFor: ['TDAH', 'TSA'],  description: 'Mots ou groupes répétés' },
  topicShiftCount:          { label: 'Changements de sujet',         category: 'Pragmatique',   unit: 'n',    relevantFor: ['TDAH'],         description: 'Digressions non motivées' },
  unfinishedSentenceCount:  { label: 'Phrases inachevées',           category: 'Pragmatique',   unit: 'n',    relevantFor: ['TDAH'],         description: 'Phrases abandonnées en cours' },
  selfCorrectionCount:      { label: 'Auto-corrections',             category: 'Pragmatique',   unit: 'n',    relevantFor: ['TDAH'],         description: '"non en fait", "enfin", "je veux dire"' },
  perseverationScore:       { label: 'Persévération',                category: 'Pragmatique',   unit: '0-1',  relevantFor: ['TSA'],          description: 'Tendance à répéter le même thème' },
  offTopicResponseCount:    { label: 'Réponses hors sujet',          category: 'Pragmatique',   unit: 'n',    relevantFor: ['TSA'],          description: 'Réponses sans rapport avec la question' },
  minimalResponseRatio:     { label: 'Ratio réponses minimales',     category: 'Pragmatique',   unit: '0-1',  relevantFor: ['TSA'],          description: 'Proportion de réponses ≤3 mots' },
  wordsPerMinute:           { label: 'Mots par minute',              category: 'Audio',         unit: 'wpm',  relevantFor: ['DYS', 'TDAH'], description: 'Débit de parole' },
  pauseCount:               { label: 'Nombre de pauses',             category: 'Audio',         unit: 'n',    relevantFor: ['TDAH'],         description: 'Pauses >500ms' },
  avgPauseDurationMs:       { label: 'Durée moy. des pauses',        category: 'Audio',         unit: 'ms',   relevantFor: ['TDAH'],         description: 'Durée moyenne des pauses' },
  maxPauseDurationMs:       { label: 'Pause la plus longue',         category: 'Audio',         unit: 'ms',   relevantFor: ['TDAH'],         description: 'Décrochage attentionnel' },
  silenceRatio:             { label: 'Ratio de silence',             category: 'Audio',         unit: '0-1',  relevantFor: ['TDAH', 'DYS'], description: 'Temps de silence / temps total' },
  pitchVarianceScore:       { label: 'Variance du pitch',            category: 'Audio',         unit: '0-1',  relevantFor: ['TSA'],          description: '0 = monotone, 1 = très variable' },
  rhythmIrregularityScore:  { label: 'Irrégularité du rythme',      category: 'Audio',         unit: '0-1',  relevantFor: ['TDAH'],         description: '0 = mécanique, 1 = chaotique' },
  speechRateScore:          { label: 'Vitesse de parole',            category: 'Audio',         unit: '0-1',  relevantFor: ['TDAH'],         description: '0 = lent, 0.5 = normal, 1 = rapide' },
  degradationRatio:         { label: 'Dégradation progressive',      category: 'Audio',         unit: 'ratio',relevantFor: ['TDAH'],         description: 'Ratio erreurs 2e moitié / 1e moitié' },
  letterIrregularityScore:  { label: 'Irrégularité des lettres',     category: 'Graphomoteur',  unit: '0-1',  relevantFor: ['DYS'],          description: 'Tailles et formes irrégulières' },
  lineAdherenceScore:       { label: 'Respect des lignes',           category: 'Graphomoteur',  unit: '0-1',  relevantFor: ['DYS'],          description: '0 = hors lignes, 1 = parfait' },
  crossingOutCount:         { label: 'Nombre de ratures',            category: 'Graphomoteur',  unit: 'n',    relevantFor: ['DYS'],          description: 'Ratures et surcharges visibles' },
  legibilityScore:          { label: 'Lisibilité globale',           category: 'Graphomoteur',  unit: '0-1',  relevantFor: ['DYS'],          description: '0 = illisible, 1 = parfait' },
  pressureScore:            { label: 'Pression estimée',             category: 'Graphomoteur',  unit: '0-1',  relevantFor: ['DYS'],          description: '0 = léger, 1 = très appuyé/variable' },
};

// ─── Text Feature Extraction (runs client-side or server-side) ───────────

const FILLERS = ['euh', 'hm', 'hein', 'ben', 'bah', 'bon', 'voilà', 'genre', 'tu vois', 'en fait'];
const CONNECTORS = ['donc', 'alors', 'parce que', 'parce', 'du coup', 'mais', 'car', 'puisque', 'cependant', 'pourtant', 'néanmoins', 'ensuite', 'puis', 'et puis', 'après', 'avant', 'pendant que', 'quand', 'lorsque', 'si bien que'];
const FUNCTION_WORDS = ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'à', 'au', 'aux', 'en', 'dans', 'sur', 'sous', 'avec', 'pour', 'par', 'ce', 'cette', 'ces', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses', 'notre', 'votre', 'leur', 'leurs', 'je', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles', 'me', 'te', 'se', 'qui', 'que', 'dont', 'où', 'ne', 'pas', 'plus', 'y', 'est', 'et', 'ou', 'ni'];
const SELF_CORRECTIONS = ['non en fait', 'en fait', 'enfin', 'je veux dire', 'non attends', 'ah non', 'non plutôt', 'c\'est-à-dire', 'ou plutôt'];

function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[.,!?;:'"()[\]{}«»""—–\-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0);
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

function countPattern(text: string, patterns: string[]): number {
  const lower = text.toLowerCase();
  let count = 0;
  for (const p of patterns) {
    const regex = new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches) count += matches.length;
  }
  return count;
}

/**
 * Extract text-based features from a transcription.
 * Does NOT require AI — purely algorithmic.
 */
export function extractTextFeatures(
  transcription: string,
  referenceText?: string,
): Partial<FeatureVector> {
  const words = tokenize(transcription);
  const totalWords = words.length;
  const uniqueWords = new Set(words);

  // Sentences (split on . ! ? or newlines)
  const sentences = transcription.split(/[.!?\n]+/).filter(s => s.trim().length > 0);
  const mlu = sentences.length > 0 ? totalWords / sentences.length : 0;

  const features: Partial<FeatureVector> = {
    totalWordCount: totalWords,
    typeTokenRatio: totalWords > 0 ? uniqueWords.size / totalWords : 0,
    meanUtteranceLength: Math.round(mlu * 10) / 10,
    discourseConnectorCount: countPattern(transcription, CONNECTORS),
    fillerWordCount: countPattern(transcription, FILLERS),
    selfCorrectionCount: countPattern(transcription, SELF_CORRECTIONS),
    functionWordRatio: totalWords > 0 ? words.filter(w => FUNCTION_WORDS.includes(w)).length / totalWords : 0,
  };

  // Repetitions: consecutive identical words or 2-grams
  let repetitions = 0;
  for (let i = 1; i < words.length; i++) {
    if (words[i] === words[i - 1] && !FUNCTION_WORDS.includes(words[i])) {
      repetitions++;
    }
  }
  features.repetitionCount = repetitions;

  // Unfinished sentences (ending with "..." or trailing off)
  features.unfinishedSentenceCount = (transcription.match(/\.\.\./g) || []).length;

  // Topic shifts (crude: count "ah oui", "sinon", "d'ailleurs", "et aussi")
  features.topicShiftCount = countPattern(transcription, ['ah oui', 'sinon', 'd\'ailleurs', 'et aussi', 'au fait', 'tiens', 'de quoi on parlait']);

  // Perseveration (most frequent content word / total content words)
  const contentWords = words.filter(w => !FUNCTION_WORDS.includes(w) && !FILLERS.includes(w) && w.length > 2);
  if (contentWords.length > 0) {
    const freq: Record<string, number> = {};
    for (const w of contentWords) freq[w] = (freq[w] || 0) + 1;
    const maxFreq = Math.max(...Object.values(freq));
    features.perseverationScore = maxFreq / contentWords.length;
  }

  // Reference text comparison
  if (referenceText) {
    const refWords = tokenize(referenceText);
    let correct = 0;
    let substitutions = 0;
    let omissions = 0;
    let additions = 0;
    let inversions = 0;

    const maxLen = Math.max(refWords.length, words.length);
    for (let i = 0; i < maxLen; i++) {
      const ref = refWords[i];
      const got = words[i];
      if (!ref && got) { additions++; continue; }
      if (ref && !got) { omissions++; continue; }
      if (ref === got) { correct++; continue; }

      // Check if it's an inversion (next word matches)
      if (i + 1 < refWords.length && i + 1 < words.length && refWords[i + 1] === got && refWords[i] === words[i + 1]) {
        inversions++;
        continue;
      }

      // Check if phonemically close (Levenshtein ≤ 2)
      if (ref && got && levenshteinDistance(ref, got) <= 2) {
        substitutions++;
      } else {
        omissions++;
      }
    }

    features.wordAccuracyRate = refWords.length > 0 ? correct / refWords.length : 1;
    features.phonemeSubstitutionCount = substitutions;
    features.omissionCount = omissions;
    features.inversionCount = inversions;
    features.additionCount = additions;

    // Normalized Levenshtein on full text
    const normLev = levenshteinDistance(
      referenceText.toLowerCase().replace(/[^a-zàâäéèêëïîôùûüÿçœæ\s]/g, ''),
      transcription.toLowerCase().replace(/[^a-zàâäéèêëïîôùûüÿçœæ\s]/g, '')
    );
    const maxTextLen = Math.max(referenceText.length, transcription.length);
    features.normalizedLevenshtein = maxTextLen > 0 ? normLev / maxTextLen : 0;

    // Degradation ratio (compare errors in 1st half vs 2nd half)
    const midRef = Math.floor(refWords.length / 2);
    const midTrans = Math.floor(words.length / 2);
    if (midRef > 0 && midTrans > 0) {
      let errors1 = 0, errors2 = 0;
      for (let i = 0; i < Math.min(midRef, midTrans); i++) {
        if (refWords[i] !== words[i]) errors1++;
      }
      for (let i = midRef; i < Math.min(refWords.length, words.length); i++) {
        if (refWords[i] !== words[i]) errors2++;
      }
      features.degradationRatio = errors1 > 0 ? errors2 / errors1 : (errors2 > 0 ? 2 : 1);
    }

    // Segmentation errors (check for words that look like 2 ref words merged, or 1 ref word split)
    let segErrors = 0;
    for (const w of words) {
      // Merged: "lechat" matches "le" + "chat"
      for (let j = 0; j < refWords.length - 1; j++) {
        if (w === refWords[j] + refWords[j + 1]) segErrors++;
      }
    }
    features.segmentationErrorCount = segErrors;
  }

  return features;
}

/**
 * Convert AudioMetadata to feature vector fields.
 */
export function extractAudioFeatures(meta: {
  totalDurationMs: number;
  pauseCount: number;
  averagePauseDurationMs: number;
  maxPauseDurationMs: number;
  wordsPerMinute: number;
  silenceRatio: number;
  pitchVariance: string;
  rhythmRegularity: string;
  speechRate: string;
}): Partial<FeatureVector> {
  return {
    wordsPerMinute: meta.wordsPerMinute,
    pauseCount: meta.pauseCount,
    avgPauseDurationMs: meta.averagePauseDurationMs,
    maxPauseDurationMs: meta.maxPauseDurationMs,
    silenceRatio: meta.silenceRatio,
    pitchVarianceScore: meta.pitchVariance === 'low' ? 0.2 : meta.pitchVariance === 'normal' ? 0.5 : 0.8,
    rhythmIrregularityScore: meta.rhythmRegularity === 'regular' ? 0.2 : meta.rhythmRegularity === 'irregular' ? 0.5 : 0.8,
    speechRateScore: meta.speechRate === 'slow' ? 0.2 : meta.speechRate === 'normal' ? 0.5 : 0.8,
  };
}

/**
 * Merge multiple partial feature vectors into a complete one.
 */
export function mergeFeatures(
  base: { studentId: string; analysisId: string; analysisMode: string; studentAge: number; date: string },
  ...partials: Partial<FeatureVector>[]
): FeatureVector {
  const empty: FeatureVector = {
    ...base,
    wordAccuracyRate: null, phonemeSubstitutionCount: null, omissionCount: null,
    inversionCount: null, additionCount: null, segmentationErrorCount: null,
    normalizedLevenshtein: null, agreementErrorCount: null, conjugationErrorCount: null,
    meanUtteranceLength: null, typeTokenRatio: null, totalWordCount: null,
    discourseConnectorCount: null, functionWordRatio: null, fillerWordCount: null,
    repetitionCount: null, topicShiftCount: null, unfinishedSentenceCount: null,
    selfCorrectionCount: null, perseverationScore: null, offTopicResponseCount: null,
    minimalResponseRatio: null, wordsPerMinute: null, pauseCount: null,
    avgPauseDurationMs: null, maxPauseDurationMs: null, silenceRatio: null,
    pitchVarianceScore: null, rhythmIrregularityScore: null, speechRateScore: null,
    degradationRatio: null, letterIrregularityScore: null, lineAdherenceScore: null,
    crossingOutCount: null, legibilityScore: null, pressureScore: null,
  };

  for (const partial of partials) {
    for (const [k, v] of Object.entries(partial)) {
      if (v !== undefined && v !== null) {
        (empty as unknown as Record<string, unknown>)[k] = v;
      }
    }
  }

  return empty;
}
