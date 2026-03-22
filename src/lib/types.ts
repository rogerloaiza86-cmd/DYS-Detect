// ─── Enums & Literals ────────────────────────────────────────────────────

export type RiskLevel = 'Sain' | 'Risque Modéré' | 'Risque Élevé' | 'Non identifié';

export type TDAHSubtype = 'emotionnel' | 'impulsif' | 'inattentif';

export type AnalysisMode = 'dictee' | 'lecture_libre' | 'expression_libre' | 'conversation_guidee';

export type DisorderCategory = 'DYS' | 'TDAH' | 'TSA';

export type ConsentStatus = 'pending' | 'signed' | 'refused';

// ─── User Profile ────────────────────────────────────────────────────────

export interface UserProfile {
  firstName: string;
  lastName: string;
  role: string;
}

// ─── Student ─────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
  grade: string;
  age: number;
  lastAnalysisDate: string | null;
  riskLevel: RiskLevel;
  // ULIS extensions
  isUlisStudent?: boolean;
  consentStatus?: ConsentStatus;
  consentDate?: string | null;
  consentGuardianName?: string | null;
}

// ─── Diagnostic Labels (ULIS training data) ─────────────────────────────

export interface DiagnosticLabel {
  id: string;
  studentId: string;
  disorder: DisorderCategory;
  subtype?: string;         // dyslexie, dysorthographie, TDAH-I, TDAH-C, TSA-1, etc.
  confirmedBy: string;      // orthophoniste, neuropsychologue, MDPH
  confirmedDate: string;
  severity?: 'leger' | 'modere' | 'severe';
  notes?: string;
}

// ─── Audio Metadata (extracted features for TDAH/TSA) ────────────────────

export interface AudioMetadata {
  totalDurationMs: number;
  pauseCount: number;
  averagePauseDurationMs: number;
  maxPauseDurationMs: number;
  wordsPerMinute: number;
  silenceRatio: number;
  // TSA prosody features
  pitchVariance: 'low' | 'normal' | 'high';
  rhythmRegularity: 'regular' | 'irregular' | 'very_irregular';
  speechRate: 'slow' | 'normal' | 'fast';
}

// ─── Video Metadata (extracted features for TSA/TDAH via computer vision) ─────

export interface VideoMetadata {
  totalDurationMs: number;
  // Gaze & attention
  gazeContactRatio: number;          // 0-1: % of time with eye contact
  gazeAvertedDurationMs: number;     // total time gaze averted
  saccadeCount: number;              // rapid eye movements
  // Facial expression
  blinkRate: number;                 // blinks per minute
  facialExpressionVariability: 'low' | 'normal' | 'high';
  emotionalCongruence: 'congruent' | 'incongruent' | 'flat';
  smileFrequency: number;           // per minute
  // Motor behavior
  headMovementIndex: number;         // 0-100: agitation score
  handFidgetingScore: number;        // 0-100
  postureChangeFrequency: number;    // per minute
  bodyRockingEvents: number;         // repetitive rocking count
  // Stereotypies & repetitive behaviors
  stereotypyEvents: number;          // hand flapping, finger flicking etc.
  selfStimulationScore: number;      // 0-100 composite
  // Interaction & synchrony
  responseLatencyMs: number;         // avg time before responding
  conversationalSynchrony: 'good' | 'moderate' | 'poor';
  turnTakingAppropriateness: 'appropriate' | 'delayed' | 'absent';
}

// ─── Markers ─────────────────────────────────────────────────────────────

export interface MarkerScore {
  name: string;
  score: number; // 0 to 100
  details?: string[];
  category?: DisorderCategory;
  subcategory?: string;
}

// ─── Analysis Result ─────────────────────────────────────────────────────

export interface AnalysisResult {
  id: string;
  studentId: string;
  date: string;
  markers: MarkerScore[];
  globalRiskLevel: RiskLevel;
  transcription: string;
  recommendations: string[];
  handwritingImage?: string;
  // Multi-trouble extensions
  analysisMode?: AnalysisMode;
  referenceText?: string;
  audioMetadata?: AudioMetadata;
  videoMetadata?: VideoMetadata;
  disorderScreening?: Record<DisorderCategory, RiskLevel>;
  tdahDominantSubtype?: TDAHSubtype; // derived from markers
}

// ─── Transcription ───────────────────────────────────────────────────────

export interface TranscriptionResult {
  text: string;
  error?: string;
}

// ─── Analysis Mode Configuration ─────────────────────────────────────────

export interface AnalysisModeConfig {
  id: AnalysisMode;
  label: string;
  description: string;
  icon: string;
  requiresReferenceText: boolean;
  supportsHandwriting: boolean;
  bestFor: DisorderCategory[];
  prompts?: string[]; // For conversation_guidee mode
}

export const ANALYSIS_MODES: AnalysisModeConfig[] = [
  {
    id: 'dictee',
    label: 'Dictée',
    description: "L'élève lit ou écrit une phrase imposée. Idéal pour repérer des indicateurs de troubles DYS.",
    icon: 'edit_note',
    requiresReferenceText: true,
    supportsHandwriting: true,
    bestFor: ['DYS'],
  },
  {
    id: 'lecture_libre',
    label: 'Lecture libre',
    description: "L'élève lit un texte à voix haute. Permet d'analyser la fluence, les pauses et la prosodie.",
    icon: 'menu_book',
    requiresReferenceText: true,
    supportsHandwriting: false,
    bestFor: ['DYS', 'TDAH'],
  },
  {
    id: 'expression_libre',
    label: 'Expression libre',
    description: "L'élève raconte librement sur un thème. Évalue la cohérence, le lexique et la pragmatique.",
    icon: 'record_voice_over',
    requiresReferenceText: false,
    supportsHandwriting: false,
    bestFor: ['TSA', 'TDAH'],
  },
  {
    id: 'conversation_guidee',
    label: 'Conversation guidée',
    description: "L'élève répond à des questions ciblées. Évalue la latence, la pragmatique et l'attention.",
    icon: 'forum',
    requiresReferenceText: false,
    supportsHandwriting: false,
    bestFor: ['TSA', 'TDAH'],
  },
];

// ─── Expression libre topic prompts ──────────────────────────────────────

export const EXPRESSION_TOPICS = [
  { id: 'journee', label: 'Raconte ta journée', icon: 'wb_sunny' },
  { id: 'vacances', label: 'Raconte tes dernières vacances', icon: 'flight' },
  { id: 'animal', label: 'Décris ton animal préféré', icon: 'pets' },
  { id: 'reve', label: 'Raconte un rêve que tu as fait', icon: 'bedtime' },
  { id: 'jeu', label: 'Explique les règles de ton jeu préféré', icon: 'sports_esports' },
  { id: 'libre', label: 'Sujet libre', icon: 'lightbulb' },
];

// ─── Conversation guidée question sets ───────────────────────────────────

export const CONVERSATION_QUESTIONS = [
  "Peux-tu me dire comment tu t'appelles et quel âge tu as ?",
  "Qu'est-ce que tu as fait ce matin avant de venir ?",
  "Si tu pouvais avoir un super-pouvoir, lequel choisirais-tu et pourquoi ?",
  "Peux-tu m'expliquer comment on fait pour préparer un chocolat chaud ?",
  "Qu'est-ce qui te rend heureux ou heureuse ?",
  "Raconte-moi un moment drôle qui t'est arrivé.",
];
