/**
 * Prompt Builder — Compose le prompt complet selon le mode d'analyse
 */
import { AnalysisMode, AudioMetadata } from '../types';
import { getDysPrompt } from './dys';
import { getTdahPrompt } from './tdah';
import { getTsaPrompt } from './tsa';

interface PromptOptions {
  mode: AnalysisMode;
  transcription: string;
  referenceText?: string;
  hasImage: boolean;
  audioMetadata?: AudioMetadata;
  studentAge?: number;
  topic?: string;            // For expression_libre
  questions?: string[];      // For conversation_guidee
  referenceProfilesText?: string; // Injected from real ULIS data
  extractedFeatures?: Record<string, number | null>; // Objective variables
}

function getModeContext(opts: PromptOptions): string {
  switch (opts.mode) {
    case 'dictee':
      return `## Contexte : Mode Dictée
L'élève devait lire ou écrire la phrase suivante :
"${opts.referenceText || 'Le petit chat boit son lait dans la cuisine.'}"

Voici la transcription de sa lecture orale :
"${opts.transcription}"

Compare la production orale avec le texte de référence pour identifier les écarts.`;

    case 'lecture_libre':
      return `## Contexte : Mode Lecture Libre
L'élève a lu à voix haute le texte suivant :
---
${opts.referenceText || '(texte de référence non fourni)'}
---

Voici la transcription de sa lecture :
"${opts.transcription}"

Analyse la fluence, les erreurs de décodage, les hésitations et la prosodie.`;

    case 'expression_libre':
      return `## Contexte : Mode Expression Libre
${opts.topic ? `Le sujet proposé était : "${opts.topic}"` : "L'élève s'est exprimé librement."}

Voici la transcription de son expression orale :
"${opts.transcription}"

Il n'y a pas de texte de référence. Analyse la production spontanée : cohérence narrative, richesse lexicale, structure syntaxique, pragmatique du langage.`;

    case 'conversation_guidee':
      return `## Contexte : Mode Conversation Guidée
L'élève a répondu à une série de questions. Voici la transcription complète de l'échange :
"${opts.transcription}"

${opts.questions ? `Les questions posées étaient :\n${opts.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}` : ''}

Analyse les réponses : pertinence pragmatique, latence, cohérence, capacité à rester sur le sujet.`;
  }
}

function getAudioMetadataSection(meta: AudioMetadata): string {
  return `
## Données audio extraites automatiquement
- Durée totale : ${Math.round(meta.totalDurationMs / 1000)}s
- Nombre de pauses : ${meta.pauseCount}
- Durée moyenne des pauses : ${Math.round(meta.averagePauseDurationMs)}ms
- Pause la plus longue : ${Math.round(meta.maxPauseDurationMs)}ms
- Mots par minute : ${Math.round(meta.wordsPerMinute)}
- Ratio de silence : ${Math.round(meta.silenceRatio * 100)}%
- Variance de hauteur (pitch) : ${meta.pitchVariance}
- Régularité du rythme : ${meta.rhythmRegularity}
- Débit de parole : ${meta.speechRate}

Utilise ces données pour affiner ton évaluation des marqueurs TDAH et TSA.`;
}

export function buildAnalysisPrompt(opts: PromptOptions): string {
  const ageContext = opts.studentAge
    ? `L'élève a ${opts.studentAge} ans. Adapte tes attentes au niveau de développement correspondant à cet âge.`
    : '';

  const hasAudioMeta = !!opts.audioMetadata;

  // Determine which disorder categories are most relevant for this mode
  const analyzeDys = opts.mode === 'dictee' || opts.mode === 'lecture_libre';
  const analyzeTdah = opts.mode !== 'dictee'; // All modes except pure dictation
  const analyzeTsa = opts.mode === 'expression_libre' || opts.mode === 'conversation_guidee';

  // Always include DYS for completeness, but weight differently
  const disorderSections = [
    getDysPrompt(opts.hasImage),
    analyzeTdah ? getTdahPrompt(hasAudioMeta) : '',
    analyzeTsa ? getTsaPrompt(hasAudioMeta) : '',
  ].filter(Boolean).join('\n');

  const audioSection = opts.audioMetadata ? getAudioMetadataSection(opts.audioMetadata) : '';

  // Build the expected output format dynamically
  const markerExamples = [
    '{ "name": "Dyslexie (Phonologie)", "score": 0, "category": "DYS", "subcategory": "phonologie", "details": [] }',
    '{ "name": "Dysorthographie", "score": 0, "category": "DYS", "subcategory": "orthographe", "details": [] }',
    '{ "name": "Dysphasie (Morphosyntaxe)", "score": 0, "category": "DYS", "subcategory": "morphosyntaxe", "details": [] }',
  ];

  if (opts.hasImage) {
    markerExamples.push('{ "name": "Dysgraphie (Grapho-moteur)", "score": 0, "category": "DYS", "subcategory": "graphomoteur", "details": [] }');
  }

  if (analyzeTdah) {
    markerExamples.push(
      '{ "name": "Attention / Concentration", "score": 0, "category": "TDAH", "subcategory": "attention", "details": [] }',
      '{ "name": "Impulsivité verbale", "score": 0, "category": "TDAH", "subcategory": "impulsivite", "details": [] }',
      '{ "name": "Fluence / Régulation", "score": 0, "category": "TDAH", "subcategory": "fluence", "details": [] }',
    );
  }

  if (analyzeTsa) {
    markerExamples.push(
      '{ "name": "Prosodie", "score": 0, "category": "TSA", "subcategory": "prosodie", "details": [] }',
      '{ "name": "Pragmatique du langage", "score": 0, "category": "TSA", "subcategory": "pragmatique", "details": [] }',
      '{ "name": "Diversité lexicale", "score": 0, "category": "TSA", "subcategory": "lexique", "details": [] }',
    );
  }

  const disorderScreeningKeys = ['DYS'];
  if (analyzeTdah) disorderScreeningKeys.push('TDAH');
  if (analyzeTsa) disorderScreeningKeys.push('TSA');
  const screeningExample = disorderScreeningKeys.map(k => `"${k}": "Sain" | "Risque Modéré" | "Risque Élevé"`).join(', ');

  // Build extracted features section
  let extractedFeaturesSection = '';
  if (opts.extractedFeatures) {
    const entries = Object.entries(opts.extractedFeatures)
      .filter(([, v]) => v !== null && v !== undefined)
      .map(([k, v]) => `- ${k}: ${typeof v === 'number' ? (v % 1 === 0 ? v : (v as number).toFixed(3)) : v}`)
      .join('\n');
    if (entries) {
      extractedFeaturesSection = `\n## Variables objectives extraites automatiquement de cet élève\n\nCes variables ont été calculées algorithmiquement (pas par IA) à partir de la transcription et des données audio :\n${entries}\n\nUtilise ces variables pour confirmer ou nuancer ton évaluation qualitative.\n`;
    }
  }

  return `Tu es un expert en troubles neurodéveloppementaux de l'enfant et de l'adolescent (DYS, TDAH, TSA). Tu analyses des productions orales et/ou écrites d'élèves pour détecter des marqueurs de risque.

${ageContext}

${getModeContext(opts)}

${opts.hasImage ? "De plus, tu disposes d'une photo d'un échantillon d'écriture manuscrite de ce même enfant.\n" : ""}
${audioSection}
${extractedFeaturesSection}
${opts.referenceProfilesText || ''}
---

${disorderSections}

---

## Instructions de scoring

- **Score 0-20** : Pas de signe significatif (normal pour l'âge)
- **Score 21-45** : Quelques indices légers, à surveiller
- **Score 46-65** : Marqueurs modérés, évaluation professionnelle conseillée
- **Score 66-85** : Marqueurs nets, prise en charge recommandée
- **Score 86-100** : Marqueurs sévères, urgence de prise en charge

Pour chaque marqueur, fournis un score ET des observations concrètes tirées du texte.

## Format de sortie

Renvoie UNIQUEMENT un objet JSON valide (pas de markdown, pas de commentaires) :
{
  "globalRiskLevel": "Sain" | "Risque Modéré" | "Risque Élevé",
  "disorderScreening": { ${screeningExample} },
  "markers": [
    ${markerExamples.join(',\n    ')}
  ],
  "recommendations": ["recommandation 1", "recommandation 2", "..."]
}`;
}
