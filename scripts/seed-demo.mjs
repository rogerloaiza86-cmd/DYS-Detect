/**
 * Script de demonstration -- insere des eleves fictifs avec analyses variees
 * Couvre tous les profils : DYS, TDAH, TSA, comorbidites, et controles sains
 * Usage : node scripts/seed-demo.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import crypto from 'crypto';

// ── Load env vars from .env.local or process.env ────────────────────────────

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env.local not found — rely on process.env
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY. Set them in .env.local or as environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Helpers ──────────────────────────────────────────────────────────────────

const uuid = () => crypto.randomUUID();

// Pre-generate stable IDs so we can cross-reference students <-> results <-> labels
const S = {
  lea:     uuid(),
  hugo:    uuid(),
  emma:    uuid(),
  nathan:  uuid(),
  chloe:   uuid(),
  lucas:   uuid(),
  jade:    uuid(),
  raphael: uuid(),
};

// ── Eleves fictifs ───────────────────────────────────────────────────────────

const STUDENTS = [
  {
    id: S.lea, first_name: 'Lea', last_name: 'Martin', initials: 'LM',
    grade: 'CE2', age: 8,
    risk_level: 'Risque Eleve',
    last_analysis_date: '12 mars 2026',
    is_ulis_student: true, consent_status: 'signed',
    consent_date: '2025-09-10T10:00:00.000Z', consent_guardian_name: 'Mme Sylvie Martin',
  },
  {
    id: S.hugo, first_name: 'Hugo', last_name: 'Bernard', initials: 'HB',
    grade: 'CM2', age: 10,
    risk_level: 'Risque Modere',
    last_analysis_date: '08 mars 2026',
    is_ulis_student: true, consent_status: 'signed',
    consent_date: '2025-11-15T09:00:00.000Z', consent_guardian_name: 'M. Philippe Bernard',
  },
  {
    id: S.emma, first_name: 'Emma', last_name: 'Dubois', initials: 'ED',
    grade: 'CM1', age: 9,
    risk_level: 'Sain',
    last_analysis_date: '05 mars 2026',
    is_ulis_student: false, consent_status: 'signed',
    consent_date: '2026-02-20T14:00:00.000Z', consent_guardian_name: 'Mme Claire Dubois',
  },
  {
    id: S.nathan, first_name: 'Nathan', last_name: 'Petit', initials: 'NP',
    grade: '6eme', age: 11,
    risk_level: 'Risque Eleve',
    last_analysis_date: '15 mars 2026',
    is_ulis_student: true, consent_status: 'signed',
    consent_date: '2024-06-15T11:00:00.000Z', consent_guardian_name: 'Mme Nathalie Petit',
  },
  {
    id: S.chloe, first_name: 'Chloe', last_name: 'Moreau', initials: 'CM',
    grade: 'CE1', age: 7,
    risk_level: 'Risque Modere',
    last_analysis_date: '01 mars 2026',
    is_ulis_student: false, consent_status: 'pending',
    consent_date: null, consent_guardian_name: null,
  },
  {
    id: S.lucas, first_name: 'Lucas', last_name: 'Lefebvre', initials: 'LL',
    grade: 'CM1', age: 9,
    risk_level: 'Risque Eleve',
    last_analysis_date: '18 mars 2026',
    is_ulis_student: true, consent_status: 'signed',
    consent_date: '2025-10-05T08:30:00.000Z', consent_guardian_name: 'Mme Anne Lefebvre',
  },
  {
    id: S.jade, first_name: 'Jade', last_name: 'Garcia', initials: 'JG',
    grade: 'CE2', age: 8,
    risk_level: 'Sain',
    last_analysis_date: '28 fev. 2026',
    is_ulis_student: false, consent_status: 'signed',
    consent_date: '2026-02-15T16:00:00.000Z', consent_guardian_name: 'M. Carlos Garcia',
  },
  {
    id: S.raphael, first_name: 'Raphael', last_name: 'Roux', initials: 'RR',
    grade: 'CM2', age: 10,
    risk_level: 'Risque Modere',
    last_analysis_date: '10 mars 2026',
    is_ulis_student: true, consent_status: 'signed',
    consent_date: '2025-04-01T09:00:00.000Z', consent_guardian_name: 'M. Frederic Roux',
  },
];

// ── Analyses fictives ────────────────────────────────────────────────────────

const RESULTS = [

  // =========================================================================
  // Lea Martin -- DYSLEXIE + DYSORTHOGRAPHIE SEVERE -- 2 analyses
  // =========================================================================

  // Analysis 1: dictee -- high DYS scores with reference text comparison
  {
    id: uuid(),
    student_id: S.lea,
    date: new Date('2026-01-20').toISOString(),
    global_risk_level: 'Risque Eleve',
    analysis_mode: 'dictee',
    reference_text: 'Le petit chat boit son lait dans la cuisine. Maman prepare le repas du soir.',
    transcription: "Le beti sha boi son le dan la kuizine. Manman brebarre le repa du soar.",
    disorder_screening: { DYS: 'Risque Eleve', TDAH: 'Sain', TSA: 'Sain' },
    audio_metadata: null,
    markers: [
      {
        name: 'Dyslexie (Phonologie)', score: 82, category: 'DYS', subcategory: 'phonologie',
        details: [
          'Confusion systematique ch/sh : "chat" -> "sha"',
          'Inversion consonne p/b : "petit" -> "beti"',
          'Substitution c/k : "cuisine" -> "kuizine"',
          'Confusion pr/br : "prepare" -> "brebarre"',
          'Simplification vocalique : "lait" -> "le", "soir" -> "soar"',
        ],
      },
      {
        name: 'Dysorthographie', score: 78, category: 'DYS', subcategory: 'orthographe',
        details: [
          'Graphie phonetique generalisee',
          'Absence des lettres muettes ("repas" -> "repa")',
          'Doublement errone ("brebarre" au lieu de "prepare")',
          'Confusion nasale : "maman" -> "manman"',
        ],
      },
      {
        name: 'Dysphasie (Morphosyntaxe)', score: 22, category: 'DYS', subcategory: 'morphosyntaxe',
        details: ['Structure syntaxique globalement preservee', 'Deux phrases correctement segmentees'],
      },
    ],
    recommendations: [
      'Bilan orthophonique complet recommande en urgence',
      'Renforcer la conscience phonologique (discrimination auditive ch/s, p/b)',
      'Exercices quotidiens de correspondance grapheme-phoneme',
      'Adapter les supports ecrits (police OpenDyslexic, interlignes augmentes)',
    ],
  },

  // Analysis 2: lecture_libre -- reading difficulties
  {
    id: uuid(),
    student_id: S.lea,
    date: new Date('2026-03-12').toISOString(),
    global_risk_level: 'Risque Eleve',
    analysis_mode: 'lecture_libre',
    reference_text: "Ce matin, nous sommes alles nous promener dans la foret. Les oiseaux chantaient dans les arbres. Nous avons ramasse des feuilles de toutes les couleurs.",
    transcription: "Ce matin nous some ale nous bromener dans la fore. Les oiso chante dan les arbe. Nous avon ramace des feuye de toute les couleur.",
    disorder_screening: { DYS: 'Risque Eleve', TDAH: 'Sain', TSA: 'Sain' },
    audio_metadata: {
      totalDurationMs: 42000, pauseCount: 14, averagePauseDurationMs: 1900,
      maxPauseDurationMs: 4500, wordsPerMinute: 48, silenceRatio: 0.38,
      pitchVariance: 'normal', rhythmRegularity: 'irregular', speechRate: 'slow',
    },
    markers: [
      {
        name: 'Dyslexie (Phonologie)', score: 85, category: 'DYS', subcategory: 'phonologie',
        details: [
          'Confusion pr/br sur "promener" -> "bromener"',
          'Omission consonnes finales multiples : "foret" -> "fore"',
          'Substitution eau/o : "oiseaux" -> "oiso"',
          'Simplification groupes consonantiques : "arbres" -> "arbe"',
          'Elision de syllabes : "feuilles" -> "feuye"',
        ],
      },
      {
        name: 'Dysorthographie', score: 80, category: 'DYS', subcategory: 'orthographe',
        details: [
          'Graphies phonetiques systematiques',
          '"sommes" -> "some", "chantaient" -> "chante"',
          'Absence systematique des marques du pluriel',
          'Erreurs sur tous les mots de plus de 2 syllabes',
        ],
      },
      {
        name: 'Dysphasie (Morphosyntaxe)', score: 28, category: 'DYS', subcategory: 'morphosyntaxe',
        details: ['Structure de phrase globalement maintenue', 'Quelques omissions de mots grammaticaux'],
      },
      {
        name: 'Attention / Concentration', score: 15, category: 'TDAH', subcategory: 'attention',
        details: ['Pas de degradation progressive notable', 'Effort soutenu malgre les difficultes'],
      },
    ],
    recommendations: [
      'Prise en charge orthophonique urgente (3 seances/semaine)',
      'Tiers-temps pour les evaluations ecrites',
      'Logiciel de synthese vocale pour la lecture (ex: VoxyGen)',
      'Amenagements PAP a formaliser avec equipe pedagogique',
      'Envisager un suivi en psychomotricite',
    ],
  },

  // =========================================================================
  // Hugo Bernard -- TDAH PREDOMINANT INATTENTIF -- 2 analyses
  // =========================================================================

  // Analysis 1: expression_libre -- attention/concentration markers, topic shifts
  {
    id: uuid(),
    student_id: S.hugo,
    date: new Date('2026-01-28').toISOString(),
    global_risk_level: 'Risque Modere',
    analysis_mode: 'expression_libre',
    transcription: "Alors euh hier je suis alle euh au parc et puis et puis y avait un chien non en fait c'etait un chat enfin je sais plus mais il etait grand et euh... qu'est-ce que je disais... ah oui et apres on est rentre et j'ai joue a... a... un jeu video je crois. Et euh aussi ma soeur elle a... non c'est pas important. Voila.",
    disorder_screening: { DYS: 'Sain', TDAH: 'Risque Modere', TSA: 'Sain' },
    audio_metadata: {
      totalDurationMs: 45000, pauseCount: 19, averagePauseDurationMs: 850,
      maxPauseDurationMs: 3800, wordsPerMinute: 98, silenceRatio: 0.24,
      pitchVariance: 'high', rhythmRegularity: 'very_irregular', speechRate: 'fast',
    },
    markers: [
      {
        name: 'Dyslexie (Phonologie)', score: 10, category: 'DYS', subcategory: 'phonologie',
        details: ['Pas de trouble phonologique identifie'],
      },
      {
        name: 'Attention / Concentration', score: 70, category: 'TDAH', subcategory: 'attention',
        details: [
          'Perte du fil narratif : "qu\'est-ce que je disais..."',
          'Auto-correction "chien non en fait c\'etait un chat"',
          'Abandon d\'idee : "ma soeur elle a... non c\'est pas important"',
          'Incapacite a terminer les idees avant d\'en commencer d\'autres',
        ],
      },
      {
        name: 'Impulsivite verbale', score: 58, category: 'TDAH', subcategory: 'impulsivite',
        details: [
          'Demarrages de phrases sans planification',
          'Corrections impulsives frequentes',
          'Debit rapide avec ralentissements brutaux',
        ],
      },
      {
        name: 'Fluence / Regulation', score: 64, category: 'TDAH', subcategory: 'fluence',
        details: [
          '19 repetitions de "euh" ou "et puis"',
          'Digressions hors sujet (parc -> chien -> chat -> jeu video -> soeur)',
          'Rythme tres irregulier',
        ],
      },
      {
        name: 'Pragmatique du langage', score: 14, category: 'TSA', subcategory: 'pragmatique',
        details: ['Langage socialement adapte malgre la desorganisation'],
      },
    ],
    recommendations: [
      'Evaluation neuropsychologique pour TDAH (type inattentif)',
      'Techniques de structuration du discours (cartes mentales)',
      'Timer visuel pour les exercices oraux',
      'Place preferentielle en classe (premier rang, pres de l\'enseignant)',
    ],
  },

  // Analysis 2: conversation_guidee -- impulsivity markers
  {
    id: uuid(),
    student_id: S.hugo,
    date: new Date('2026-03-08').toISOString(),
    global_risk_level: 'Risque Modere',
    analysis_mode: 'conversation_guidee',
    transcription: "Q: Comment tu t'appelles ? R: Hugo Bernard j'ai 10 ans. Q: Qu'est-ce que tu as fait ce matin ? R: Ce matin euh... j'ai... ah oui le bus et puis la cantine non d'abord la classe et la maitresse elle a dit un truc mais j'ai oublie quoi. Q: Si tu avais un super-pouvoir ? R: VOLER ! Non attends etre invisible ! Non voler c'est mieux ! Ah je sais pas en fait. Q: Explique comment on fait un chocolat chaud ? R: Ben on met du lait et du chocolat et euh... on le met dans... attends je recommence. On prend du lait on le chauffe et euh... ah oui on met le chocolat dedans et on melange.",
    disorder_screening: { DYS: 'Sain', TDAH: 'Risque Modere', TSA: 'Sain' },
    audio_metadata: {
      totalDurationMs: 58000, pauseCount: 15, averagePauseDurationMs: 950,
      maxPauseDurationMs: 2800, wordsPerMinute: 115, silenceRatio: 0.19,
      pitchVariance: 'high', rhythmRegularity: 'very_irregular', speechRate: 'fast',
    },
    markers: [
      {
        name: 'Dyslexie (Phonologie)', score: 8, category: 'DYS', subcategory: 'phonologie',
        details: ['Aucun trouble phonologique'],
      },
      {
        name: 'Attention / Concentration', score: 68, category: 'TDAH', subcategory: 'attention',
        details: [
          'Oubli du contenu de la maitresse',
          'Difficulte a organiser chronologiquement (bus/cantine/classe)',
          'Besoin de recommencer l\'explication du chocolat chaud',
        ],
      },
      {
        name: 'Impulsivite verbale', score: 75, category: 'TDAH', subcategory: 'impulsivite',
        details: [
          'Reponses impulsives avant la fin de la reflexion',
          '3 changements de reponse en 5 secondes (voler/invisible/voler)',
          'Interruptions de sa propre pensee',
          'Exclamation spontanee "VOLER !"',
        ],
      },
      {
        name: 'Fluence / Regulation', score: 60, category: 'TDAH', subcategory: 'fluence',
        details: [
          'Debit variable : accelerations puis blocages',
          'Recit desorganise mais contenu riche',
          'Auto-corrections multiples',
        ],
      },
      {
        name: 'Pragmatique du langage', score: 12, category: 'TSA', subcategory: 'pragmatique',
        details: ['Bonne interaction sociale, reponses en contexte, humour present'],
      },
    ],
    recommendations: [
      'Confirmer le diagnostic TDAH via bilan neuropsychologique',
      'Strategies de regulation (methode STOP-THINK-GO)',
      'Routine de reformulation avant de repondre',
      'Envisager evaluation pour traitement medicamenteux',
    ],
  },

  // =========================================================================
  // Emma Dubois -- PROFIL SAIN (controle) -- 1 analyse
  // =========================================================================

  {
    id: uuid(),
    student_id: S.emma,
    date: new Date('2026-03-05').toISOString(),
    global_risk_level: 'Sain',
    analysis_mode: 'dictee',
    reference_text: 'Le petit chat boit son lait dans la cuisine. Maman prepare le repas du soir.',
    transcription: "Le petit chat boit son lait dans la cuisine. Maman prepare le repas du soir.",
    disorder_screening: { DYS: 'Sain', TDAH: 'Sain', TSA: 'Sain' },
    audio_metadata: null,
    markers: [
      {
        name: 'Dyslexie (Phonologie)', score: 4, category: 'DYS', subcategory: 'phonologie',
        details: ['Aucune erreur phonologique detectee'],
      },
      {
        name: 'Dysorthographie', score: 6, category: 'DYS', subcategory: 'orthographe',
        details: ['Transcription fidele au texte de reference'],
      },
      {
        name: 'Dysphasie (Morphosyntaxe)', score: 3, category: 'DYS', subcategory: 'morphosyntaxe',
        details: ['Excellente structure syntaxique'],
      },
    ],
    recommendations: [
      'Aucune intervention necessaire',
      'Continuer la lecture plaisir quotidienne',
      'Proposer des textes plus complexes pour stimuler la progression',
    ],
  },

  // =========================================================================
  // Nathan Petit -- TSA + DYS LEGER (comorbidite) -- 3 analyses
  // =========================================================================

  // Analysis 1: conversation_guidee -- pragmatic language issues, prosodie plate
  {
    id: uuid(),
    student_id: S.nathan,
    date: new Date('2025-12-10').toISOString(),
    global_risk_level: 'Risque Eleve',
    analysis_mode: 'conversation_guidee',
    transcription: "Q: Comment tu t'appelles ? R: Nathan Petit, 11 ans, 6eme. Q: Qu'est-ce que tu as fait ce matin ? R: Je me suis leve a 7h12, j'ai mange des cereales Chocapic exactement 42 grammes, je me suis brosse les dents pendant 2 minutes, j'ai pris le bus numero 7. Q: Si tu avais un super-pouvoir ? R: Les super-pouvoirs n'existent pas. C'est scientifiquement impossible. Q: Explique comment faire un chocolat chaud ? R: On prend 200ml de lait, on le met dans une casserole a 65 degres, on ajoute 2 cuilleres de cacao, on melange 47 secondes. Q: Qu'est-ce qui te rend heureux ? R: Quand mes Lego sont bien ranges par couleur.",
    disorder_screening: { DYS: 'Sain', TDAH: 'Sain', TSA: 'Risque Eleve' },
    audio_metadata: {
      totalDurationMs: 65000, pauseCount: 6, averagePauseDurationMs: 500,
      maxPauseDurationMs: 950, wordsPerMinute: 80, silenceRatio: 0.06,
      pitchVariance: 'low', rhythmRegularity: 'regular', speechRate: 'normal',
    },
    markers: [
      {
        name: 'Dyslexie (Phonologie)', score: 6, category: 'DYS', subcategory: 'phonologie',
        details: ['Aucune difficulte phonologique'],
      },
      {
        name: 'Attention / Concentration', score: 10, category: 'TDAH', subcategory: 'attention',
        details: ['Excellente concentration, aucune perte de fil'],
      },
      {
        name: 'Prosodie', score: 80, category: 'TSA', subcategory: 'prosodie',
        details: [
          'Voix monotone constante tout au long de l\'entretien',
          'Aucune variation emotionnelle meme sur questions ludiques',
          'Rythme mecanique et regulier comme une lecture de liste',
          'Absence d\'intonation interrogative ou exclamative',
        ],
      },
      {
        name: 'Pragmatique du langage', score: 88, category: 'TSA', subcategory: 'pragmatique',
        details: [
          'Reponse ultra-litterale a la question du super-pouvoir',
          'Absence totale de jeu imaginatif',
          'Precision excessive des details (7h12, 42g, 47 secondes)',
          'Pas d\'engagement emotionnel dans les reponses',
          'Interet restreint pour le rangement/ordre (Lego par couleur)',
        ],
      },
      {
        name: 'Diversite lexicale', score: 62, category: 'TSA', subcategory: 'lexique',
        details: [
          'Vocabulaire precis mais registre formel inadapte pour 11 ans',
          'Omnipresence des chiffres et mesures exactes',
          'Style encyclopedique plutot que conversationnel',
        ],
      },
    ],
    recommendations: [
      'Evaluation TSA par un Centre Ressource Autisme (CRA)',
      'Travail sur les habiletes sociales et conversationnelles',
      'Programme de competences sociales en petit groupe',
      'Amenagements : consignes explicites, supports visuels',
    ],
  },

  // Analysis 2: expression_libre -- low lexical diversity, perseveration
  {
    id: uuid(),
    student_id: S.nathan,
    date: new Date('2026-02-05').toISOString(),
    global_risk_level: 'Risque Eleve',
    analysis_mode: 'expression_libre',
    transcription: "Les dinosaures sont apparus il y a 230 millions d'annees au Trias. Le T-Rex mesurait 12,3 metres exactement. Il avait 60 dents. Les velociraptors pesaient 15 kilogrammes. Le brachiosaure mesurait 26 metres. Moi j'aime les dinosaures. Les dinosaures c'est mieux que les mammiferes. Les dinosaures sont les plus grands animaux terrestres. J'ai 47 figurines de dinosaures chez moi.",
    disorder_screening: { DYS: 'Sain', TDAH: 'Sain', TSA: 'Risque Eleve' },
    audio_metadata: {
      totalDurationMs: 38000, pauseCount: 4, averagePauseDurationMs: 600,
      maxPauseDurationMs: 1200, wordsPerMinute: 78, silenceRatio: 0.08,
      pitchVariance: 'low', rhythmRegularity: 'regular', speechRate: 'normal',
    },
    markers: [
      {
        name: 'Dyslexie (Phonologie)', score: 8, category: 'DYS', subcategory: 'phonologie',
        details: ['Aucune difficulte phonologique'],
      },
      {
        name: 'Attention / Concentration', score: 12, category: 'TDAH', subcategory: 'attention',
        details: ['Tres concentre sur son sujet, aucune distraction'],
      },
      {
        name: 'Prosodie', score: 76, category: 'TSA', subcategory: 'prosodie',
        details: [
          'Voix monotone tout au long de la narration',
          'Absence totale de variation emotionnelle',
          'Debit regulier comme une lecture de liste encyclopedique',
        ],
      },
      {
        name: 'Pragmatique du langage', score: 84, category: 'TSA', subcategory: 'pragmatique',
        details: [
          'Perseveration marquee sur les dinosaures (interet restreint)',
          'Enumeration de faits sans structure narrative',
          'Absence de perspective : pas de lien avec l\'interlocuteur',
          'Pas de connecteurs de discours (donc, ensuite, par contre...)',
          'Quantification obsessionnelle (47 figurines)',
        ],
      },
      {
        name: 'Diversite lexicale', score: 72, category: 'TSA', subcategory: 'lexique',
        details: [
          'Vocabulaire tres specialise (Trias, velociraptors, brachiosaure)',
          'Registre inadapte pour son age (style encyclopedique)',
          'Repetition du mot "dinosaures" 5 fois',
        ],
      },
    ],
    recommendations: [
      'Confirme le profil TSA observe en conversation guidee',
      'Utiliser les interets restreints comme levier pedagogique',
      'Travail sur la diversification des sujets de conversation',
      'Exercices de narration avec structure debut-milieu-fin',
    ],
  },

  // Analysis 3: dictee -- mild DYS markers
  {
    id: uuid(),
    student_id: S.nathan,
    date: new Date('2026-03-15').toISOString(),
    global_risk_level: 'Risque Modere',
    analysis_mode: 'dictee',
    reference_text: 'Les scientifiques ont decouvert une nouvelle espece de papillon dans la foret amazonienne.',
    transcription: "Les scientifiques ont decouvert une nouvelle espece de papillon dans la foret amazoniene.",
    disorder_screening: { DYS: 'Risque Modere', TDAH: 'Sain', TSA: 'Sain' },
    audio_metadata: null,
    markers: [
      {
        name: 'Dyslexie (Phonologie)', score: 32, category: 'DYS', subcategory: 'phonologie',
        details: [
          'Legere difficulte sur les doubles consonnes',
          'Simplification "amazonienne" -> "amazoniene" (perte du doublement)',
        ],
      },
      {
        name: 'Dysorthographie', score: 28, category: 'DYS', subcategory: 'orthographe',
        details: [
          'Quelques erreurs orthographiques sur mots complexes',
          'Bonne maitrise globale de l\'orthographe courante',
        ],
      },
      {
        name: 'Dysphasie (Morphosyntaxe)', score: 8, category: 'DYS', subcategory: 'morphosyntaxe',
        details: ['Structure syntaxique parfaitement maitrisee'],
      },
    ],
    recommendations: [
      'DYS leger en complement du profil TSA dominant',
      'Exercices cibles sur les consonnes doubles',
      'Continuer le suivi orthophonique pour consolider',
    ],
  },

  // =========================================================================
  // Chloe Moreau -- DYS LEGER + signes TDAH, consentement en attente -- 1 analyse
  // =========================================================================

  {
    id: uuid(),
    student_id: S.chloe,
    date: new Date('2026-03-01').toISOString(),
    global_risk_level: 'Risque Modere',
    analysis_mode: 'dictee',
    reference_text: "Le chat mange la souris. Il court dans le jardin. Maman appelle le chat.",
    transcription: "Le chat manje la souris. Il cour dans le jardin. Maman abelle le chat.",
    disorder_screening: { DYS: 'Risque Modere', TDAH: 'Sain', TSA: 'Sain' },
    audio_metadata: null,
    markers: [
      {
        name: 'Dyslexie (Phonologie)', score: 48, category: 'DYS', subcategory: 'phonologie',
        details: [
          'Confusion g/j sur "mange" -> "manje"',
          'Confusion p/b sur "appelle" -> "abelle"',
          'Omission de consonne finale "court" -> "cour"',
        ],
      },
      {
        name: 'Dysorthographie', score: 40, category: 'DYS', subcategory: 'orthographe',
        details: [
          'Erreurs phonetiquement proches mais systematiques',
          'Difficulte avec les consonnes sourdes/sonores',
        ],
      },
      {
        name: 'Dysphasie (Morphosyntaxe)', score: 15, category: 'DYS', subcategory: 'morphosyntaxe',
        details: ['Syntaxe correcte pour le niveau CE1'],
      },
      {
        name: 'Attention / Concentration', score: 30, category: 'TDAH', subcategory: 'attention',
        details: [
          'Quelques signes d\'inattention a confirmer',
          'Reevaluation necessaire en mode oral',
        ],
      },
    ],
    recommendations: [
      'Exercices de phonologie cibles sur consonnes sonores/sourdes (g/j, p/b)',
      'Strategies de relecture active apres ecriture',
      'Observer si les difficultes attentionnelles persistent en classe',
      'Reevaluation dans 3 mois en mode lecture libre ou conversation',
      'Obtenir le consentement parental pour poursuivre le suivi',
    ],
  },

  // =========================================================================
  // Lucas Lefebvre -- TDAH SEVERE COMBINE + DYS -- 2 analyses
  // =========================================================================

  // Analysis 1: lecture_libre -- fluence issues + attention drops
  {
    id: uuid(),
    student_id: S.lucas,
    date: new Date('2026-02-15').toISOString(),
    global_risk_level: 'Risque Eleve',
    analysis_mode: 'lecture_libre',
    reference_text: "Le renard roux traverse la riviere pour rejoindre sa taniere. Il porte un poisson dans sa gueule. Ses petits l'attendent patiemment.",
    transcription: "Le renar rou traverse la... euh... la rividre pour rejoinde sa tanidre. Il borte un boison dans sa... sa... gueule. Ses betits l'at... euh de quoi on parlait ? Ah oui. Ses betits l'atandent bacianment.",
    disorder_screening: { DYS: 'Risque Modere', TDAH: 'Risque Eleve', TSA: 'Sain' },
    audio_metadata: {
      totalDurationMs: 52000, pauseCount: 20, averagePauseDurationMs: 750,
      maxPauseDurationMs: 5200, wordsPerMinute: 42, silenceRatio: 0.32,
      pitchVariance: 'high', rhythmRegularity: 'very_irregular', speechRate: 'slow',
    },
    markers: [
      {
        name: 'Dyslexie (Phonologie)', score: 55, category: 'DYS', subcategory: 'phonologie',
        details: [
          'Omission consonnes finales : "renard" -> "renar", "roux" -> "rou"',
          'Confusion p/b systematique : "porte" -> "borte", "poisson" -> "boison", "petits" -> "betits", "patiemment" -> "bacianment"',
          'Substitution de voyelle : "riviere" -> "rividre", "taniere" -> "tanidre"',
        ],
      },
      {
        name: 'Dysorthographie', score: 48, category: 'DYS', subcategory: 'orthographe',
        details: [
          'Erreurs phonetiques sur les consonnes sourdes/sonores',
          'Degradation progressive de la qualite orthographique',
        ],
      },
      {
        name: 'Attention / Concentration', score: 82, category: 'TDAH', subcategory: 'attention',
        details: [
          'Decrochage attentionnel a 5.2s (pause maximale)',
          'Perte du fil : "de quoi on parlait ?"',
          'Degradation nette en fin de texte (plus d\'erreurs)',
          '20 interruptions en 52 secondes',
        ],
      },
      {
        name: 'Fluence / Regulation', score: 78, category: 'TDAH', subcategory: 'fluence',
        details: [
          'Lecture tres lente (42 mots/min vs 80 attendu en CM1)',
          'Multiples repetitions de syllabes "sa... sa..."',
          'Rythme chaotique : acceleration -> longue pause -> reprise',
        ],
      },
      {
        name: 'Impulsivite verbale', score: 65, category: 'TDAH', subcategory: 'impulsivite',
        details: [
          'Tentative de continuer malgre les erreurs',
          'Pas de relecture spontanee',
        ],
      },
    ],
    recommendations: [
      'Bilan neuropsychologique urgent pour TDAH (type combine)',
      'Bilan orthophonique en complement pour le profil DYS',
      'Textes segmentes : une phrase a la fois avec pause obligatoire',
      'Utiliser un guide de lecture (regle sous la ligne)',
      'Amenagements immediats : tiers-temps, lecteur pour les consignes',
    ],
  },

  // Analysis 2: expression_libre -- impulsivity + disorganized speech
  {
    id: uuid(),
    student_id: S.lucas,
    date: new Date('2026-03-18').toISOString(),
    global_risk_level: 'Risque Eleve',
    analysis_mode: 'expression_libre',
    transcription: "Donc euh j'ai euh mon chien il s'appelle euh Rex et il est euh... il est grand et noir enfin marron en fait je sais plus et euh hier il a mange ma chaussure et ma mere elle etait trop en colere et elle a crie et moi j'ai rigole et euh... de quoi on parlait ? Ah oui Rex et euh il aime les os et euh les croquettes et euh... et aussi il fait pipi partout et c'est degoutant mais moi je l'aime quand meme et euh...",
    disorder_screening: { DYS: 'Sain', TDAH: 'Risque Eleve', TSA: 'Sain' },
    audio_metadata: {
      totalDurationMs: 50000, pauseCount: 24, averagePauseDurationMs: 650,
      maxPauseDurationMs: 4800, wordsPerMinute: 130, silenceRatio: 0.20,
      pitchVariance: 'high', rhythmRegularity: 'very_irregular', speechRate: 'fast',
    },
    markers: [
      {
        name: 'Dyslexie (Phonologie)', score: 12, category: 'DYS', subcategory: 'phonologie',
        details: ['Pas de trouble phonologique en expression orale'],
      },
      {
        name: 'Attention / Concentration', score: 88, category: 'TDAH', subcategory: 'attention',
        details: [
          '24 interruptions en 50 secondes',
          'Perte du fil : "de quoi on parlait ?"',
          'Incapacite a maintenir un sujet plus de 8 secondes',
          'Pause de 4.8s = decrochage attentionnel majeur',
        ],
      },
      {
        name: 'Impulsivite verbale', score: 80, category: 'TDAH', subcategory: 'impulsivite',
        details: [
          'Auto-corrections rapides : "grand noir enfin marron"',
          'Demarrages sans planification',
          'Debit tres rapide par moments (130 mots/min)',
          'Ajout compulsif de details ("fait pipi partout")',
        ],
      },
      {
        name: 'Fluence / Regulation', score: 85, category: 'TDAH', subcategory: 'fluence',
        details: [
          '16 occurrences de "euh" en 50 secondes',
          'Rythme chaotique : acceleration -> pause -> acceleration',
          'Digressions multiples (chien -> chaussure -> mere -> cri -> rire -> os -> croquettes -> pipi)',
          'Incapacite a conclure le recit',
        ],
      },
      {
        name: 'Pragmatique du langage', score: 15, category: 'TSA', subcategory: 'pragmatique',
        details: ['Langage social adapte, humour present ("j\'ai rigole", "je l\'aime quand meme")'],
      },
    ],
    recommendations: [
      'TDAH combine tres probable -- bilan neuropsychologique en priorite',
      'Methylphenidate a discuter avec neuropediatre',
      'Amenagements immediats : place au 1er rang, consignes courtes et visuelles',
      'Timer visuel + fidget autorise en classe',
      'Plan de regulation emotionnelle et comportementale',
    ],
  },

  // =========================================================================
  // Jade Garcia -- PROFIL SAIN (controle) -- 1 analyse lecture_libre
  // =========================================================================

  {
    id: uuid(),
    student_id: S.jade,
    date: new Date('2026-02-28').toISOString(),
    global_risk_level: 'Sain',
    analysis_mode: 'lecture_libre',
    reference_text: "La petite fille marche dans la foret. Elle ramasse des champignons. Son panier est presque plein.",
    transcription: "La petite fille marche dans la foret. Elle ramasse des champignons. Son panier est presque plein.",
    disorder_screening: { DYS: 'Sain', TDAH: 'Sain', TSA: 'Sain' },
    audio_metadata: {
      totalDurationMs: 18000, pauseCount: 3, averagePauseDurationMs: 600,
      maxPauseDurationMs: 900, wordsPerMinute: 95, silenceRatio: 0.10,
      pitchVariance: 'normal', rhythmRegularity: 'regular', speechRate: 'normal',
    },
    markers: [
      {
        name: 'Dyslexie (Phonologie)', score: 5, category: 'DYS', subcategory: 'phonologie',
        details: ['Aucune erreur phonologique'],
      },
      {
        name: 'Dysorthographie', score: 4, category: 'DYS', subcategory: 'orthographe',
        details: ['Lecture fidele au texte de reference'],
      },
      {
        name: 'Attention / Concentration', score: 6, category: 'TDAH', subcategory: 'attention',
        details: ['Lecture soutenue et reguliere du debut a la fin'],
      },
      {
        name: 'Fluence / Regulation', score: 5, category: 'TDAH', subcategory: 'fluence',
        details: ['Debit fluide et regulier, 95 mots/min (norme CE2)'],
      },
      {
        name: 'Prosodie', score: 8, category: 'TSA', subcategory: 'prosodie',
        details: ['Intonation expressive et adaptee au contenu'],
      },
      {
        name: 'Pragmatique du langage', score: 5, category: 'TSA', subcategory: 'pragmatique',
        details: ['Lecture expressive avec respect de la ponctuation'],
      },
    ],
    recommendations: [
      'Aucune inquietude',
      'Encourager la lecture reguliere et variee',
      'Profil harmonieux pour le CE2',
    ],
  },

  // =========================================================================
  // Raphael Roux -- TDAH HYPERACTIF-IMPULSIF MODERE -- 1 analyse
  // =========================================================================

  {
    id: uuid(),
    student_id: S.raphael,
    date: new Date('2026-03-10').toISOString(),
    global_risk_level: 'Risque Modere',
    analysis_mode: 'conversation_guidee',
    transcription: "Q: Comment tu t'appelles ? R: RaphaelRouxdix-- euh 10 ans ! Q: Qu'est-ce que tu as fait ce matin ? R: Des maths c'etait trop long et la maitresse elle parlait et moi je bougeais sur ma chaise et Thomas il m'a dit arrete et la maitresse elle a dit Raphael concentre-toi. Q: Si tu avais un super-pouvoir ? R: Courir mega vite ! Comme Flash ! Parce que je peux pas rester assis c'est trop dur. Q: Peux-tu m'expliquer comment on fait un chocolat chaud ? R: Facile ! Du lait du chocolat boum dans le micro-ondes termine ! ... Non en vrai faut le mettre dans une tasse d'abord. Et le faire chauffer. Et mettre le chocolat. Voila c'est bon. Q: Qu'est-ce qui te rend heureux ? R: Le foot ! Et courir ! Et grimper aux arbres ! Et nager ! Et...",
    disorder_screening: { DYS: 'Sain', TDAH: 'Risque Modere', TSA: 'Sain' },
    audio_metadata: {
      totalDurationMs: 55000, pauseCount: 8, averagePauseDurationMs: 450,
      maxPauseDurationMs: 1500, wordsPerMinute: 135, silenceRatio: 0.08,
      pitchVariance: 'high', rhythmRegularity: 'irregular', speechRate: 'fast',
    },
    markers: [
      {
        name: 'Dyslexie (Phonologie)', score: 7, category: 'DYS', subcategory: 'phonologie',
        details: ['Aucun trouble phonologique'],
      },
      {
        name: 'Attention / Concentration', score: 45, category: 'TDAH', subcategory: 'attention',
        details: [
          'Difficulte a rester concentre en classe (rapport de la maitresse)',
          'Agitation physique rapportee (bouger sur la chaise)',
          'Discours qui rebondit entre les idees',
        ],
      },
      {
        name: 'Impulsivite verbale', score: 72, category: 'TDAH', subcategory: 'impulsivite',
        details: [
          'Reponses precipitees : nom + age en un seul mot "RaphaelRouxdix"',
          'Reponse impulsive au chocolat chaud puis auto-correction',
          'Onomatopee impulsive "boum"',
          'Enumeration rapide sans pause (foot, courir, grimper, nager...)',
          'Explication incomplete necessitant correction',
        ],
      },
      {
        name: 'Fluence / Regulation', score: 55, category: 'TDAH', subcategory: 'fluence',
        details: [
          'Debit tres rapide (135 mots/min)',
          'Tres peu de pauses, enchainement immediat',
          'Difficulte a reguler le rythme',
          'Exclamations frequentes marquant l\'excitation motrice',
        ],
      },
      {
        name: 'Hyperactivite motrice (indices verbaux)', score: 68, category: 'TDAH', subcategory: 'hyperactivite',
        details: [
          'References explicites a l\'agitation : "je bougeais sur ma chaise"',
          'Choix du super-pouvoir lie au mouvement (courir mega vite)',
          '"je peux pas rester assis c\'est trop dur"',
          'Interets exclusivement physiques (foot, courir, grimper, nager)',
          'Difficulte a rester immobile rapportee par l\'enseignante',
        ],
      },
      {
        name: 'Pragmatique du langage', score: 10, category: 'TSA', subcategory: 'pragmatique',
        details: ['Interaction sociale adaptee, enthousiaste, sens de l\'humour'],
      },
    ],
    recommendations: [
      'Profil TDAH a predominance hyperactive-impulsive a confirmer',
      'Bilan neuropsychologique avec echelles de Conners',
      'Autoriser le mouvement en classe (fidget, coussin dynamique)',
      'Pauses motrices regulieres (missions de distribution, tableau)',
      'Strategies de canalisation de l\'energie (responsabilites physiques)',
      'Evaluer l\'impact sur les apprentissages avec l\'equipe pedagogique',
    ],
  },
];

// ── Diagnostics confirmes (donnees d'entrainement ULIS) ──────────────────────

const LABELS = [
  // Lea Martin -- DYS confirme par orthophoniste
  {
    id: uuid(), student_id: S.lea, disorder: 'DYS', subtype: 'dyslexie',
    confirmed_by: 'orthophoniste', confirmed_date: '2025-09-15',
    severity: 'severe', notes: 'Dyslexie phonologique severe, diagnostic pose en septembre 2025',
  },
  {
    id: uuid(), student_id: S.lea, disorder: 'DYS', subtype: 'dysorthographie',
    confirmed_by: 'orthophoniste', confirmed_date: '2025-09-15',
    severity: 'severe', notes: 'Dysorthographie associee a la dyslexie, meme bilan',
  },

  // Hugo Bernard -- TDAH confirme par neuropsychologue
  {
    id: uuid(), student_id: S.hugo, disorder: 'TDAH', subtype: 'TDAH-I',
    confirmed_by: 'neuropsychologue', confirmed_date: '2026-01-08',
    severity: 'modere', notes: 'TDAH predominant inattentif, diagnostic neuropsychologique janvier 2026',
  },

  // Nathan Petit -- TSA confirme par MDPH + DYS par orthophoniste
  {
    id: uuid(), student_id: S.nathan, disorder: 'TSA', subtype: 'TSA-1',
    confirmed_by: 'MDPH', confirmed_date: '2024-06-10',
    severity: 'modere', notes: 'TSA sans deficience intellectuelle (Asperger), QI 128, notification MDPH',
  },
  {
    id: uuid(), student_id: S.nathan, disorder: 'DYS', subtype: 'dyslexie',
    confirmed_by: 'orthophoniste', confirmed_date: '2025-03-20',
    severity: 'leger', notes: 'Dyslexie legere en comorbidite avec TSA, difficultes sur les mots complexes',
  },

  // Lucas Lefebvre -- TDAH + DYS confirmes
  {
    id: uuid(), student_id: S.lucas, disorder: 'TDAH', subtype: 'TDAH-C',
    confirmed_by: 'neuropsychologue', confirmed_date: '2025-11-20',
    severity: 'severe', notes: 'TDAH combine severe, en attente de traitement medicamenteux',
  },
  {
    id: uuid(), student_id: S.lucas, disorder: 'DYS', subtype: 'dyslexie',
    confirmed_by: 'orthophoniste', confirmed_date: '2025-12-05',
    severity: 'modere', notes: 'Dyslexie phonologique moderee, confusion sourdes/sonores persistante',
  },

  // Raphael Roux -- TDAH confirme
  {
    id: uuid(), student_id: S.raphael, disorder: 'TDAH', subtype: 'TDAH-H',
    confirmed_by: 'neuropsychologue', confirmed_date: '2025-04-15',
    severity: 'modere', notes: 'TDAH a predominance hyperactive-impulsive, suivi en cours',
  },
];

// ── Insertion ────────────────────────────────────────────────────────────────

async function seed() {
  console.log('DYS-Detect -- Insertion des donnees de demonstration\n');

  // Safety check: only delete rows with demo IDs
  const studentIds = STUDENTS.map(s => s.id);

  console.log('Nettoyage des donnees demo existantes...');

  // Also clean any previously seeded demo data (old format IDs)
  const oldDemoIds = [
    'demo-s1', 'demo-s2', 'demo-s3', 'demo-s4',
    'demo-s5', 'demo-s6', 'demo-s7', 'demo-s8',
  ];
  const allStudentIds = [...studentIds, ...oldDemoIds];

  const { error: delLblErr } = await supabase.from('diagnostic_labels').delete().in('student_id', allStudentIds);
  if (delLblErr) console.warn('Warning deleting labels:', delLblErr.message);

  const { error: delResErr } = await supabase.from('analysis_results').delete().in('student_id', allStudentIds);
  if (delResErr) console.warn('Warning deleting results:', delResErr.message);

  const { error: delStuErr } = await supabase.from('students').delete().in('id', allStudentIds);
  if (delStuErr) console.warn('Warning deleting students:', delStuErr.message);

  console.log('Nettoyage termine.\n');

  // Insert students
  const { error: stuErr } = await supabase.from('students').insert(STUDENTS);
  if (stuErr) {
    console.error('ERREUR insertion eleves:', stuErr.message);
    process.exit(1);
  }
  console.log(`${STUDENTS.length} eleves inseres`);

  // Insert analysis results
  const { error: resErr } = await supabase.from('analysis_results').insert(RESULTS);
  if (resErr) {
    console.error('ERREUR insertion resultats:', resErr.message);
    process.exit(1);
  }
  console.log(`${RESULTS.length} analyses inserees`);

  // Insert diagnostic labels
  const { error: lblErr } = await supabase.from('diagnostic_labels').insert(LABELS);
  if (lblErr) {
    console.error('ERREUR insertion diagnostics:', lblErr.message);
    process.exit(1);
  }
  console.log(`${LABELS.length} diagnostics confirmes inseres`);

  // Summary
  console.log('\nResume des profils :');
  console.log('-'.repeat(80));
  for (const s of STUDENTS) {
    const count = RESULTS.filter(r => r.student_id === s.id).length;
    const labels = LABELS.filter(l => l.student_id === s.id);
    const risk = s.risk_level === 'Risque Eleve' ? '[ELEVE]'
               : s.risk_level === 'Risque Modere' ? '[MODERE]'
               : s.risk_level === 'Sain' ? '[ SAIN ]'
               : '[  ?  ]';
    const diags = labels.length > 0
      ? ' | Diag: ' + labels.map(l => `${l.disorder}(${l.subtype})`).join(', ')
      : '';
    const ulis = s.is_ulis_student ? ' | ULIS' : '';
    const consent = s.consent_status === 'pending' ? ' | Consentement en attente' : '';
    console.log(`  ${risk} ${s.first_name.padEnd(9)} ${s.last_name.padEnd(10)} ${s.grade.padEnd(5)} ${s.age}ans  ${count} analyse(s)${diags}${ulis}${consent}`);
  }
  console.log('-'.repeat(80));

  // Mode coverage summary
  const modes = {};
  for (const r of RESULTS) {
    modes[r.analysis_mode] = (modes[r.analysis_mode] || 0) + 1;
  }
  console.log('\nCouverture des modes d\'analyse :');
  for (const [mode, count] of Object.entries(modes)) {
    console.log(`  ${mode}: ${count} analyse(s)`);
  }

  console.log(`\nTotal: ${STUDENTS.length} eleves, ${RESULTS.length} analyses, ${LABELS.length} diagnostics`);
  console.log('Base de donnees prete pour la demo !');
}

seed().catch((err) => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
