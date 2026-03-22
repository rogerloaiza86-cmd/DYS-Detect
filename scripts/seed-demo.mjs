/**
 * Script de démonstration — insère 8 élèves fictifs avec analyses variées
 * Inclut des profils DYS, TDAH et TSA pour montrer le système multi-troubles
 * Usage : node scripts/seed-demo.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = 'https://xrvehxoqcsgrjwcsdett.supabase.co';
const SUPABASE_KEY  = 'sb_publishable_uhyAgPy4bSZZKfT2tQL1fA_6wttlYdI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Élèves fictifs ──────────────────────────────────────────────────────

const STUDENTS = [
  { id: 'demo-s1', first_name: 'Léa',     last_name: 'Martin',    initials: 'LM', grade: 'CE2', age: 8,  risk_level: 'Risque Élevé',  last_analysis_date: '20 mars 2026', is_ulis_student: true,  consent_status: 'signed' },
  { id: 'demo-s2', first_name: 'Hugo',     last_name: 'Bernard',   initials: 'HB', grade: 'CM1', age: 9,  risk_level: 'Risque Modéré', last_analysis_date: '18 mars 2026', is_ulis_student: true,  consent_status: 'signed' },
  { id: 'demo-s3', first_name: 'Emma',     last_name: 'Dubois',    initials: 'ED', grade: 'CP',  age: 6,  risk_level: 'Sain',          last_analysis_date: '15 mars 2026', is_ulis_student: false, consent_status: 'pending' },
  { id: 'demo-s4', first_name: 'Nathan',   last_name: 'Petit',     initials: 'NP', grade: 'CM2', age: 11, risk_level: 'Risque Élevé',  last_analysis_date: '19 mars 2026', is_ulis_student: true,  consent_status: 'signed' },
  { id: 'demo-s5', first_name: 'Chloé',    last_name: 'Moreau',    initials: 'CM', grade: 'CE1', age: 7,  risk_level: 'Risque Modéré', last_analysis_date: '17 mars 2026', is_ulis_student: false, consent_status: 'pending' },
  { id: 'demo-s6', first_name: 'Lucas',    last_name: 'Lefebvre',  initials: 'LL', grade: 'CM1', age: 10, risk_level: 'Risque Élevé',  last_analysis_date: '21 mars 2026', is_ulis_student: true,  consent_status: 'signed' },
  { id: 'demo-s7', first_name: 'Jade',     last_name: 'Garcia',    initials: 'JG', grade: 'CE2', age: 8,  risk_level: 'Sain',          last_analysis_date: '14 mars 2026', is_ulis_student: false, consent_status: 'pending' },
  { id: 'demo-s8', first_name: 'Raphaël',  last_name: 'Roux',      initials: 'RR', grade: 'CM2', age: 11, risk_level: 'Risque Modéré', last_analysis_date: '20 mars 2026', is_ulis_student: true,  consent_status: 'signed' },
];

// ─── Analyses fictives ───────────────────────────────────────────────────

const RESULTS = [
  // ═══ Léa Martin — DYSLEXIE SÉVÈRE — 2 analyses (évolution) ═══════════
  {
    id: 'demo-r1a',
    student_id: 'demo-s1',
    date: new Date('2026-02-10').toISOString(),
    global_risk_level: 'Risque Modéré',
    analysis_mode: 'dictee',
    reference_text: 'Le petit chat boit son lait dans la cuisine.',
    transcription: "Le beti sha boi son lè dan la kuizine.",
    disorder_screening: { DYS: 'Risque Modéré' },
    markers: [
      { name: 'Dyslexie (Phonologie)', score: 62, category: 'DYS', subcategory: 'phonologie', details: ['Confusion ch/sh systématique', 'Substitution p/b sur "petit"→"beti"', 'Substitution c/k sur "cuisine"→"kuizine"'] },
      { name: 'Dysorthographie', score: 55, category: 'DYS', subcategory: 'orthographe', details: ['Graphie phonétique de "lait"→"lè"', 'Confusion des graphèmes complexes'] },
      { name: 'Dysphasie (Morphosyntaxe)', score: 20, category: 'DYS', subcategory: 'morphosyntaxe', details: ['Structure syntaxique préservée'] },
    ],
    recommendations: ['Renforcer la conscience phonologique', 'Exercices de discrimination auditive ch/s, p/b', 'Bilan orthophonique recommandé'],
  },
  {
    id: 'demo-r1b',
    student_id: 'demo-s1',
    date: new Date('2026-03-20').toISOString(),
    global_risk_level: 'Risque Élevé',
    analysis_mode: 'lecture_libre',
    reference_text: "Ce matin, nous sommes allés nous promener dans la forêt. Les oiseaux chantaient dans les arbres. Nous avons ramassé des feuilles de toutes les couleurs.",
    transcription: "Ce matin nous some alé nous bromener dans la forê. Les oiso chantè dan les arbe. Nous avon ramacé des feuye de toute les couleur.",
    disorder_screening: { DYS: 'Risque Élevé', TDAH: 'Sain' },
    audio_metadata: { totalDurationMs: 38000, pauseCount: 12, averagePauseDurationMs: 1800, maxPauseDurationMs: 4200, wordsPerMinute: 52, silenceRatio: 0.35, pitchVariance: 'normal', rhythmRegularity: 'irregular', speechRate: 'slow' },
    markers: [
      { name: 'Dyslexie (Phonologie)', score: 82, category: 'DYS', subcategory: 'phonologie', details: ['Confusion pr/br sur "promener"→"bromener"', 'Omission consonnes finales multiples', 'Substitution eau/o sur "oiseaux"→"oiso"', 'Simplification des groupes consonantiques'] },
      { name: 'Dysorthographie', score: 78, category: 'DYS', subcategory: 'orthographe', details: ['Graphies phonétiques systématiques', '"sommes"→"some", "chantaient"→"chantè"', 'Absence de marques du pluriel'] },
      { name: 'Dysphasie (Morphosyntaxe)', score: 30, category: 'DYS', subcategory: 'morphosyntaxe', details: ['Structure de phrase globalement maintenue', 'Quelques omissions de mots grammaticaux'] },
      { name: 'Attention / Concentration', score: 18, category: 'TDAH', subcategory: 'attention', details: ['Pas de dégradation progressive notable'] },
    ],
    recommendations: ['Prise en charge orthophonique urgente', 'Tiers-temps pour les évaluations', 'Logiciel de synthèse vocale pour la lecture', 'Aménagements PAP à formaliser'],
  },

  // ═══ Hugo Bernard — TDAH PRÉDOMINANT — 2 analyses ════════════════════
  {
    id: 'demo-r2a',
    student_id: 'demo-s2',
    date: new Date('2026-02-20').toISOString(),
    global_risk_level: 'Risque Modéré',
    analysis_mode: 'expression_libre',
    transcription: "Alors euh hier je suis allé euh au parc et puis et puis y avait un chien non en fait c'était un chat enfin je sais plus mais il était grand et euh... qu'est-ce que je disais... ah oui et après on est rentré et j'ai joué à... à... un jeu vidéo je crois.",
    disorder_screening: { DYS: 'Sain', TDAH: 'Risque Modéré', TSA: 'Sain' },
    audio_metadata: { totalDurationMs: 42000, pauseCount: 18, averagePauseDurationMs: 800, maxPauseDurationMs: 3800, wordsPerMinute: 95, silenceRatio: 0.22, pitchVariance: 'high', rhythmRegularity: 'very_irregular', speechRate: 'fast' },
    markers: [
      { name: 'Dyslexie (Phonologie)', score: 12, category: 'DYS', subcategory: 'phonologie', details: ['Pas de trouble phonologique'] },
      { name: 'Attention / Concentration', score: 68, category: 'TDAH', subcategory: 'attention', details: ['Perte du fil narratif ("qu\'est-ce que je disais")', 'Auto-correction "chien non en fait c\'était un chat"', 'Incapacité à terminer les idées'] },
      { name: 'Impulsivité verbale', score: 55, category: 'TDAH', subcategory: 'impulsivite', details: ['Démarrages de phrases sans planification', 'Corrections impulsives fréquentes', 'Débit rapide avec ralentissements brutaux'] },
      { name: 'Fluence / Régulation', score: 62, category: 'TDAH', subcategory: 'fluence', details: ['17 répétitions de "euh" ou "et puis"', 'Digressions hors sujet (chien→chat→jeu vidéo)', 'Rythme très irrégulier'] },
      { name: 'Pragmatique du langage', score: 15, category: 'TSA', subcategory: 'pragmatique', details: ['Langage socialement adapté malgré la désorganisation'] },
    ],
    recommendations: ['Évaluation neuropsychologique pour TDAH', 'Techniques de structuration du discours', 'Timer visuel pour les exercices', 'Place préférentielle en classe (premier rang)'],
  },
  {
    id: 'demo-r2b',
    student_id: 'demo-s2',
    date: new Date('2026-03-18').toISOString(),
    global_risk_level: 'Risque Modéré',
    analysis_mode: 'conversation_guidee',
    transcription: "Q: Comment tu t'appelles ? R: Hugo Bernard j'ai 9 ans. Q: Qu'est-ce que tu as fait ce matin ? R: Ce matin euh... j'ai... ah oui le bus et puis la cantine non d'abord la classe et la maîtresse elle a dit un truc mais j'ai oublié quoi. Q: Si tu avais un super-pouvoir ? R: VOLER ! Non attends être invisible ! Non voler c'est mieux ! Ah je sais pas.",
    disorder_screening: { DYS: 'Sain', TDAH: 'Risque Modéré', TSA: 'Sain' },
    audio_metadata: { totalDurationMs: 55000, pauseCount: 14, averagePauseDurationMs: 900, maxPauseDurationMs: 2800, wordsPerMinute: 110, silenceRatio: 0.18, pitchVariance: 'high', rhythmRegularity: 'very_irregular', speechRate: 'fast' },
    markers: [
      { name: 'Dyslexie (Phonologie)', score: 8, category: 'DYS', subcategory: 'phonologie', details: ['Aucun trouble phonologique'] },
      { name: 'Attention / Concentration', score: 65, category: 'TDAH', subcategory: 'attention', details: ['Oubli de ce que la maîtresse a dit', 'Difficulté à organiser chronologiquement', 'Mélange bus/cantine/classe sans ordre'] },
      { name: 'Impulsivité verbale', score: 72, category: 'TDAH', subcategory: 'impulsivite', details: ['Réponses avant la fin de la réflexion', '3 changements de réponse en 5 secondes (voler/invisible/voler)', 'Interruptions de sa propre pensée'] },
      { name: 'Fluence / Régulation', score: 58, category: 'TDAH', subcategory: 'fluence', details: ['Débit variable : accélérations puis blocages', 'Récit désorganisé mais riche'] },
      { name: 'Pragmatique du langage', score: 12, category: 'TSA', subcategory: 'pragmatique', details: ['Bonne interaction sociale, réponses en contexte'] },
    ],
    recommendations: ['Confirmer le diagnostic TDAH via bilan neuropsy', 'Stratégies de régulation (STOP-THINK-GO)', 'Routine de reformulation avant réponse', 'Possibilité de traitement médicamenteux à évaluer'],
  },

  // ═══ Emma Dubois — PROFIL SAIN — 1 analyse ═══════════════════════════
  {
    id: 'demo-r3',
    student_id: 'demo-s3',
    date: new Date('2026-03-15').toISOString(),
    global_risk_level: 'Sain',
    analysis_mode: 'dictee',
    reference_text: 'Le petit chat boit son lait dans la cuisine.',
    transcription: "Le petit chat boit son lait dans la cuisine.",
    disorder_screening: { DYS: 'Sain' },
    markers: [
      { name: 'Dyslexie (Phonologie)', score: 5, category: 'DYS', subcategory: 'phonologie', details: ['Aucune erreur phonologique'] },
      { name: 'Dysorthographie', score: 8, category: 'DYS', subcategory: 'orthographe', details: ['Transcription fidèle'] },
      { name: 'Dysphasie (Morphosyntaxe)', score: 3, category: 'DYS', subcategory: 'morphosyntaxe', details: ['Excellente structure'] },
    ],
    recommendations: ['Aucune intervention nécessaire', 'Continuer la lecture plaisir quotidienne', 'Proposer des textes plus complexes pour stimuler la progression'],
  },

  // ═══ Nathan Petit — TSA + DYS — 3 analyses (évolution) ═══════════════
  {
    id: 'demo-r4a',
    student_id: 'demo-s4',
    date: new Date('2026-01-25').toISOString(),
    global_risk_level: 'Risque Modéré',
    analysis_mode: 'dictee',
    reference_text: 'Le petit chat boit son lait dans la cuisine.',
    transcription: "Le petit chat boit son lait dans la cuisine.",
    disorder_screening: { DYS: 'Sain' },
    markers: [
      { name: 'Dyslexie (Phonologie)', score: 10, category: 'DYS', subcategory: 'phonologie', details: ['Lecture correcte mais mécanique'] },
      { name: 'Dysorthographie', score: 12, category: 'DYS', subcategory: 'orthographe', details: ['Orthographe correcte'] },
      { name: 'Dysphasie (Morphosyntaxe)', score: 8, category: 'DYS', subcategory: 'morphosyntaxe', details: ['RAS'] },
    ],
    recommendations: ['Mode dictée insuffisant pour évaluer ce profil', 'Passer en expression libre ou conversation guidée'],
  },
  {
    id: 'demo-r4b',
    student_id: 'demo-s4',
    date: new Date('2026-02-20').toISOString(),
    global_risk_level: 'Risque Élevé',
    analysis_mode: 'expression_libre',
    transcription: "Les dinosaures sont apparus il y a 230 millions d'années au Trias. Le T-Rex mesurait 12,3 mètres exactement. Il avait 60 dents. Les vélociraptors pesaient 15 kilogrammes. Le brachiosaure mesurait 26 mètres. Moi j'aime les dinosaures. Les dinosaures c'est mieux que les mammifères. Les dinosaures.",
    disorder_screening: { DYS: 'Sain', TDAH: 'Sain', TSA: 'Risque Élevé' },
    audio_metadata: { totalDurationMs: 35000, pauseCount: 4, averagePauseDurationMs: 600, maxPauseDurationMs: 1200, wordsPerMinute: 78, silenceRatio: 0.08, pitchVariance: 'low', rhythmRegularity: 'regular', speechRate: 'normal' },
    markers: [
      { name: 'Dyslexie (Phonologie)', score: 8, category: 'DYS', subcategory: 'phonologie', details: ['Aucune difficulté phonologique'] },
      { name: 'Attention / Concentration', score: 15, category: 'TDAH', subcategory: 'attention', details: ['Très concentré sur son sujet'] },
      { name: 'Prosodie', score: 75, category: 'TSA', subcategory: 'prosodie', details: ['Voix monotone tout au long', 'Absence totale de variation émotionnelle', 'Débit régulier comme une lecture de liste'] },
      { name: 'Pragmatique du langage', score: 82, category: 'TSA', subcategory: 'pragmatique', details: ['Persévération sur les dinosaures (intérêt restreint)', 'Énumération de faits sans narration', 'Absence de perspective : pas de lien avec l\'interlocuteur', 'Pas de connecteurs de discours'] },
      { name: 'Diversité lexicale', score: 70, category: 'TSA', subcategory: 'lexique', details: ['Vocabulaire très spécialisé (Trias, vélociraptors)', 'Registre inadapté pour 11 ans (style encyclopédique)', 'Répétition du mot "dinosaures" 4 fois'] },
    ],
    recommendations: ['Évaluation TSA par un Centre Ressource Autisme', 'Travail sur les habiletés sociales et conversationnelles', 'Utiliser les intérêts restreints comme levier pédagogique', 'Groupe de compétences sociales'],
  },
  {
    id: 'demo-r4c',
    student_id: 'demo-s4',
    date: new Date('2026-03-19').toISOString(),
    global_risk_level: 'Risque Élevé',
    analysis_mode: 'conversation_guidee',
    transcription: "Q: Comment tu t'appelles ? R: Nathan Petit, 11 ans, CM2. Q: Qu'est-ce que tu as fait ce matin ? R: Je me suis levé à 7h12, j'ai mangé des céréales Chocapic exactement 42 grammes, je me suis brossé les dents pendant 2 minutes, j'ai pris le bus numéro 7. Q: Si tu avais un super-pouvoir ? R: Les super-pouvoirs n'existent pas. C'est scientifiquement impossible. Q: Explique comment faire un chocolat chaud ? R: On prend 200ml de lait, on le met dans une casserole à 65 degrés, on ajoute 2 cuillères de cacao, on mélange 47 secondes.",
    disorder_screening: { DYS: 'Sain', TDAH: 'Sain', TSA: 'Risque Élevé' },
    audio_metadata: { totalDurationMs: 62000, pauseCount: 6, averagePauseDurationMs: 500, maxPauseDurationMs: 900, wordsPerMinute: 82, silenceRatio: 0.06, pitchVariance: 'low', rhythmRegularity: 'regular', speechRate: 'normal' },
    markers: [
      { name: 'Dyslexie (Phonologie)', score: 5, category: 'DYS', subcategory: 'phonologie', details: ['Aucune difficulté'] },
      { name: 'Attention / Concentration', score: 10, category: 'TDAH', subcategory: 'attention', details: ['Excellente concentration, pas de perte de fil'] },
      { name: 'Prosodie', score: 78, category: 'TSA', subcategory: 'prosodie', details: ['Voix monotone constante', 'Aucune variation émotionnelle même sur questions ludiques', 'Rythme mécanique régulier'] },
      { name: 'Pragmatique du langage', score: 88, category: 'TSA', subcategory: 'pragmatique', details: ['Réponse ultra-littérale à la question super-pouvoir', 'Absence de jeu imaginatif', 'Précision excessive des détails (7h12, 42g, 47 secondes)', 'Pas d\'engagement émotionnel dans les réponses'] },
      { name: 'Diversité lexicale', score: 65, category: 'TSA', subcategory: 'lexique', details: ['Vocabulaire précis mais registre inadapté (style technique)', 'Omniprésence des chiffres et mesures exactes'] },
    ],
    recommendations: ['Diagnostic TSA hautement probable — orienter vers CRA', 'Programme PECS ou Denver pour habiletés sociales', 'Scénarios sociaux pour la pragmatique conversationnelle', 'Aménagements : consignes explicites et visuelles', 'Valoriser la rigueur intellectuelle comme force'],
  },

  // ═══ Chloé Moreau — DYS LÉGER + signes TDAH — 1 analyse ══════════════
  {
    id: 'demo-r5',
    student_id: 'demo-s5',
    date: new Date('2026-03-17').toISOString(),
    global_risk_level: 'Risque Modéré',
    analysis_mode: 'lecture_libre',
    reference_text: "Le chat mange la souris. Il court dans le jardin. Maman appelle le chat. Il revient vite.",
    transcription: "Le chat manje la souris. Il cour dans le jardin. Maman abelle le chat. Il revient... euh... il revient vite. Ah non attends. Il revient vite !",
    disorder_screening: { DYS: 'Risque Modéré', TDAH: 'Risque Modéré' },
    audio_metadata: { totalDurationMs: 28000, pauseCount: 8, averagePauseDurationMs: 1100, maxPauseDurationMs: 3200, wordsPerMinute: 68, silenceRatio: 0.28, pitchVariance: 'normal', rhythmRegularity: 'irregular', speechRate: 'slow' },
    markers: [
      { name: 'Dyslexie (Phonologie)', score: 45, category: 'DYS', subcategory: 'phonologie', details: ['Confusion g/j sur "mange"→"manje"', 'Confusion p/b sur "appelle"→"abelle"', 'Omission de consonne finale "court"→"cour"'] },
      { name: 'Dysorthographie', score: 38, category: 'DYS', subcategory: 'orthographe', details: ['Erreurs phonétiquement proches'] },
      { name: 'Attention / Concentration', score: 48, category: 'TDAH', subcategory: 'attention', details: ['Pause longue de 3.2s au milieu de la lecture', 'Relecture et auto-correction ("ah non attends")'] },
      { name: 'Fluence / Régulation', score: 42, category: 'TDAH', subcategory: 'fluence', details: ['Hésitation "euh" et reprise de la phrase', 'Débit irrégulier avec accélérations en fin de phrase'] },
    ],
    recommendations: ['Exercices de phonologie ciblés sur les consonnes sonores/sourdes', 'Stratégies de relecture active', 'Observer si les difficultés attentionnelles persistent', 'Réévaluation dans 3 mois'],
  },

  // ═══ Lucas Lefebvre — TDAH SÉVÈRE + DYS — 2 analyses ═════════════════
  {
    id: 'demo-r6a',
    student_id: 'demo-s6',
    date: new Date('2026-02-28').toISOString(),
    global_risk_level: 'Risque Élevé',
    analysis_mode: 'expression_libre',
    transcription: "Donc euh j'ai euh mon chien il s'appelle euh Rex et il est euh... il est grand et noir enfin marron en fait je sais plus et euh hier il a mangé ma chaussure et ma mère elle était trop en colère et elle a crié et moi j'ai rigolé et euh... de quoi on parlait ? Ah oui Rex et euh il aime les os et euh les croquettes et euh...",
    disorder_screening: { DYS: 'Sain', TDAH: 'Risque Élevé', TSA: 'Sain' },
    audio_metadata: { totalDurationMs: 48000, pauseCount: 22, averagePauseDurationMs: 650, maxPauseDurationMs: 4500, wordsPerMinute: 125, silenceRatio: 0.20, pitchVariance: 'high', rhythmRegularity: 'very_irregular', speechRate: 'fast' },
    markers: [
      { name: 'Dyslexie (Phonologie)', score: 10, category: 'DYS', subcategory: 'phonologie', details: ['Pas de trouble phonologique'] },
      { name: 'Attention / Concentration', score: 85, category: 'TDAH', subcategory: 'attention', details: ['22 interruptions en 48 secondes', 'Perte du fil ("de quoi on parlait ?")', 'Incapacité à maintenir un sujet plus de 10 secondes', 'Pause de 4.5s = décrochage attentionnel'] },
      { name: 'Impulsivité verbale', score: 78, category: 'TDAH', subcategory: 'impulsivite', details: ['Auto-corrections rapides ("grand noir enfin marron")', 'Démarrages sans planification', 'Débit très rapide par moments (125 mots/min)'] },
      { name: 'Fluence / Régulation', score: 82, category: 'TDAH', subcategory: 'fluence', details: ['14 occurrences de "euh" en 48s', 'Rythme chaotique : accélération → pause → accélération', 'Digressions (chien → chaussure → mère → rire → chien)'] },
      { name: 'Pragmatique du langage', score: 18, category: 'TSA', subcategory: 'pragmatique', details: ['Langage social adapté, humour présent ("j\'ai rigolé")'] },
    ],
    recommendations: ['TDAH très probable — bilan neuropsychologique urgent', 'Méthylphénidate à discuter avec neuropédiatre', 'Aménagements immédiats : place au 1er rang, consignes courtes', 'Timer visuel + fidget autorisé', 'Plan de régulation émotionnelle'],
  },
  {
    id: 'demo-r6b',
    student_id: 'demo-s6',
    date: new Date('2026-03-21').toISOString(),
    global_risk_level: 'Risque Élevé',
    analysis_mode: 'dictee',
    reference_text: "Les scientifiques ont découvert une nouvelle espèce de papillon dans la forêt amazonienne.",
    transcription: "Les siantifik on décuvèr une nouvèle espese de papion dans la forê... euh... amazoni... amazoniene.",
    disorder_screening: { DYS: 'Risque Modéré', TDAH: 'Risque Élevé' },
    markers: [
      { name: 'Dyslexie (Phonologie)', score: 52, category: 'DYS', subcategory: 'phonologie', details: ['Simplification "scientifiques"→"siantifik"', 'Omission syllabique "papillon"→"papion"', '"découvert"→"décuvèr" (inversion voyelle)'] },
      { name: 'Dysorthographie', score: 48, category: 'DYS', subcategory: 'orthographe', details: ['Graphies phonétiques', 'Difficultés avec mots complexes'] },
      { name: 'Attention / Concentration', score: 75, category: 'TDAH', subcategory: 'attention', details: ['Décrochage sur "amazonienne" (mot long)', 'Hésitation longue avant le dernier mot', 'Davantage d\'erreurs en fin de phrase'] },
      { name: 'Fluence / Régulation', score: 70, category: 'TDAH', subcategory: 'fluence', details: ['Dégradation progressive de la qualité', 'Effort cognitif visible sur les mots complexes'] },
    ],
    recommendations: ['Profil mixte TDAH + DYS à explorer', 'Bilan orthophonique en complément du bilan neuropsy', 'Textes segmentés (une phrase à la fois)', 'Reformulation avant écriture'],
  },

  // ═══ Jade Garcia — PROFIL SAIN — 1 analyse ═══════════════════════════
  {
    id: 'demo-r7',
    student_id: 'demo-s7',
    date: new Date('2026-03-14').toISOString(),
    global_risk_level: 'Sain',
    analysis_mode: 'expression_libre',
    transcription: "Hier avec ma mamie on est allées au marché et on a acheté des fraises. Elles étaient super bonnes ! Après on a fait un gâteau ensemble, c'était trop rigolo parce que mamie elle a mis de la farine partout. Le gâteau il était au chocolat et j'en ai mangé deux parts.",
    disorder_screening: { DYS: 'Sain', TDAH: 'Sain', TSA: 'Sain' },
    audio_metadata: { totalDurationMs: 32000, pauseCount: 5, averagePauseDurationMs: 700, maxPauseDurationMs: 1100, wordsPerMinute: 92, silenceRatio: 0.12, pitchVariance: 'normal', rhythmRegularity: 'regular', speechRate: 'normal' },
    markers: [
      { name: 'Dyslexie (Phonologie)', score: 5, category: 'DYS', subcategory: 'phonologie', details: ['Aucune erreur'] },
      { name: 'Attention / Concentration', score: 8, category: 'TDAH', subcategory: 'attention', details: ['Récit structuré et complet'] },
      { name: 'Fluence / Régulation', score: 6, category: 'TDAH', subcategory: 'fluence', details: ['Débit fluide et régulier'] },
      { name: 'Prosodie', score: 10, category: 'TSA', subcategory: 'prosodie', details: ['Intonation expressive et adaptée'] },
      { name: 'Pragmatique du langage', score: 5, category: 'TSA', subcategory: 'pragmatique', details: ['Narration cohérente, émotions partagées, humour'] },
      { name: 'Diversité lexicale', score: 8, category: 'TSA', subcategory: 'lexique', details: ['Vocabulaire riche et adapté à l\'âge'] },
    ],
    recommendations: ['Aucune inquiétude', 'Encourager la lecture et l\'expression écrite', 'Profil harmonieux pour CE2'],
  },

  // ═══ Raphaël Roux — TSA LÉGER + TDAH LÉGER — 1 analyse ══════════════
  {
    id: 'demo-r8',
    student_id: 'demo-s8',
    date: new Date('2026-03-20').toISOString(),
    global_risk_level: 'Risque Modéré',
    analysis_mode: 'conversation_guidee',
    transcription: "Q: Comment tu t'appelles ? R: Raphaël. Q: Et ton nom de famille ? R: Roux. Q: Quel âge tu as ? R: 11. Q: Qu'est-ce que tu as fait ce matin ? R: Des maths. Q: Tu peux me raconter un peu plus ? R: On a fait des additions et des soustractions. C'était facile. Q: Si tu avais un super-pouvoir lequel tu choisirais ? R: Euh... je sais pas... peut-être être intelligent. Q: Plus intelligent ? R: Oui pour comprendre les gens. Parce que des fois je comprends pas pourquoi ils font des trucs bizarres.",
    disorder_screening: { DYS: 'Sain', TDAH: 'Risque Modéré', TSA: 'Risque Modéré' },
    audio_metadata: { totalDurationMs: 58000, pauseCount: 10, averagePauseDurationMs: 1500, maxPauseDurationMs: 3800, wordsPerMinute: 55, silenceRatio: 0.30, pitchVariance: 'low', rhythmRegularity: 'regular', speechRate: 'slow' },
    markers: [
      { name: 'Dyslexie (Phonologie)', score: 8, category: 'DYS', subcategory: 'phonologie', details: ['Aucun trouble'] },
      { name: 'Attention / Concentration', score: 40, category: 'TDAH', subcategory: 'attention', details: ['Réponses très courtes nécessitant des relances', 'Latence de réponse élevée (pauses longues)'] },
      { name: 'Prosodie', score: 55, category: 'TSA', subcategory: 'prosodie', details: ['Voix relativement plate', 'Peu de variation émotionnelle', 'Débit lent et régulier'] },
      { name: 'Pragmatique du langage', score: 58, category: 'TSA', subcategory: 'pragmatique', details: ['Réponses minimales sans élaboration spontanée', 'Insight intéressant ("comprendre les gens")', 'Difficulté à développer sans relance explicite', 'Utilisation de "trucs bizarres" = difficulté à nommer les comportements sociaux'] },
      { name: 'Diversité lexicale', score: 35, category: 'TSA', subcategory: 'lexique', details: ['Vocabulaire restreint mais approprié', 'Phrases courtes et simples'] },
    ],
    recommendations: ['Profil TSA léger / Asperger à évaluer', 'Groupe d\'habiletés sociales recommandé', 'Travail sur l\'élaboration des réponses', 'Exploiter son insight comme levier thérapeutique', 'Bilan au CRA si ce n\'est pas déjà fait'],
  },
];

// ─── Diagnostics confirmés (données d'entraînement) ─────────────────────

const LABELS = [
  { id: 'lbl-01', student_id: 'demo-s1', disorder: 'DYS', subtype: 'dyslexie', confirmed_by: 'orthophoniste', confirmed_date: '2025-09-15', severity: 'severe', notes: 'Diagnostic posé en septembre 2025' },
  { id: 'lbl-02', student_id: 'demo-s4', disorder: 'TSA', subtype: 'TSA-1', confirmed_by: 'CRA', confirmed_date: '2024-06-10', severity: 'modere', notes: 'TSA sans déficience intellectuelle (Asperger), QI 128' },
  { id: 'lbl-03', student_id: 'demo-s6', disorder: 'TDAH', subtype: 'TDAH-C', confirmed_by: 'neuropsychologue', confirmed_date: '2025-11-20', severity: 'severe', notes: 'TDAH combiné, en attente de traitement médicamenteux' },
  { id: 'lbl-04', student_id: 'demo-s2', disorder: 'TDAH', subtype: 'TDAH-I', confirmed_by: 'neuropsychologue', confirmed_date: '2026-01-08', severity: 'modere', notes: 'TDAH inattentif prédominant' },
  { id: 'lbl-05', student_id: 'demo-s8', disorder: 'TSA', subtype: 'TSA-1', confirmed_by: 'CRA', confirmed_date: '2025-03-22', severity: 'leger', notes: 'Suspicion TSA léger, suivi en cours' },
];

// ─── Insertion ─────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 DYS-Detect — Insertion des données de démonstration\n');

  // Nettoyer les données demo existantes
  const ids = STUDENTS.map(s => s.id);
  console.log('🧹 Nettoyage des données existantes...');

  await supabase.from('diagnostic_labels').delete().in('student_id', ids);
  await supabase.from('analysis_results').delete().in('student_id', ids);
  await supabase.from('students').delete().in('id', ids);

  // Insérer les élèves
  const { error: stuErr } = await supabase.from('students').insert(STUDENTS);
  if (stuErr) {
    console.error('❌ Erreur insertion élèves:', stuErr.message);
    process.exit(1);
  }
  console.log(`✅ ${STUDENTS.length} élèves insérés`);

  // Insérer les résultats
  const { error: resErr } = await supabase.from('analysis_results').insert(RESULTS);
  if (resErr) {
    console.error('❌ Erreur insertion résultats:', resErr.message);
    process.exit(1);
  }
  console.log(`✅ ${RESULTS.length} analyses insérées`);

  // Insérer les diagnostics
  const { error: lblErr } = await supabase.from('diagnostic_labels').insert(LABELS);
  if (lblErr) {
    console.error('❌ Erreur insertion diagnostics:', lblErr.message);
    process.exit(1);
  }
  console.log(`✅ ${LABELS.length} diagnostics confirmés insérés`);

  // Résumé
  console.log('\n📊 Résumé des profils :');
  console.log('─'.repeat(65));
  for (const s of STUDENTS) {
    const count = RESULTS.filter(r => r.student_id === s.id).length;
    const label = LABELS.find(l => l.student_id === s.id);
    const emoji = s.risk_level === 'Risque Élevé' ? '🔴' : s.risk_level === 'Risque Modéré' ? '🟠' : s.risk_level === 'Sain' ? '🟢' : '⚪';
    const diag = label ? ` [${label.disorder} ${label.subtype}]` : '';
    const ulis = s.is_ulis_student ? ' 🏫ULIS' : '';
    console.log(`  ${emoji} ${s.first_name.padEnd(9)} ${s.last_name.padEnd(10)} ${s.grade.padEnd(4)} ${s.age}ans  ${count} analyse(s)${diag}${ulis}`);
  }
  console.log('─'.repeat(65));
  console.log('\n🎉 Base de données prête pour la démo !');
}

seed().catch(console.error);
