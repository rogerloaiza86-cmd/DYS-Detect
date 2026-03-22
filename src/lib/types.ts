export type RiskLevel = 'Sain' | 'Risque Modéré' | 'Risque Élevé' | 'Non identifié';

export interface UserProfile {
  firstName: string;
  lastName: string;
  role: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
  grade: string;
  age: number;
  lastAnalysisDate: string | null;
  riskLevel: RiskLevel;
}

export interface MarkerScore {
  name: string;
  score: number; // 0 to 100
  details?: string[];
}

export interface AnalysisResult {
  id: string;
  studentId: string;
  date: string;
  markers: MarkerScore[];
  globalRiskLevel: RiskLevel;
  transcription: string;
  recommendations: string[];
  handwritingImage?: string; // Base64 or URL
}

export interface TranscriptionResult {
  text: string;
  error?: string;
}
