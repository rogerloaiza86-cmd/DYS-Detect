import { Student, AnalysisResult } from './types';

export const mockStudents: Student[] = [
  {
    id: '1',
    firstName: 'Jean',
    lastName: 'Dupont',
    initials: 'JD',
    grade: 'CM1-B',
    age: 9,
    lastAnalysisDate: '12 Oct 2023',
    riskLevel: 'Risque Élevé'
  },
  {
    id: '2',
    firstName: 'Marie',
    lastName: 'Lefebvre',
    initials: 'ML',
    grade: 'CM1-A',
    age: 10,
    lastAnalysisDate: '08 Oct 2023',
    riskLevel: 'Risque Modéré'
  },
  {
    id: '3',
    firstName: 'Thomas',
    lastName: 'Martin',
    initials: 'TM',
    grade: 'CE2-C',
    age: 8,
    lastAnalysisDate: '05 Oct 2023',
    riskLevel: 'Non identifié'
  },
  {
    id: '4',
    firstName: 'Sophie',
    lastName: 'Petit',
    initials: 'SP',
    grade: 'CM1-B',
    age: 9,
    lastAnalysisDate: '01 Oct 2023',
    riskLevel: 'Sain'
  }
];

export const mockAnalysisResult: AnalysisResult = {
  id: 'res-1',
  studentId: '1',
  date: new Date().toISOString(),
  globalRiskLevel: 'Risque Élevé',
  transcription: "Le peti- le petit chaperon rouge marché dans la faurê. I-il a vu un... un loup.",
  markers: [
    {
      name: 'Dyslexie (Phonologie)',
      score: 85,
      details: [
        'Hésitations marquées sur les syllabes complexes',
        'Confusions phonétiques (faurê / forêt)',
        'Lecture saccadée'
      ]
    },
    {
      name: 'Dysphasie (Morphosyntaxe)',
      score: 40,
      details: [
        'Quelques erreurs d\'accord mineures',
        'Structure de phrase globalement correcte'
      ]
    },
    {
      name: 'Fluence / TDAH',
      score: 65,
      details: [
        'Pauses excessives (2.5s en moyenne)',
        'Répétitions impulsives ("I-il", "un... un")'
      ]
    },
    {
      name: 'Anxiété (Prosodie)',
      score: 75,
      details: [
        'Voix tremblante en fin de phrase',
        'Micro-coupures respiratoires fréquentes'
      ]
    },
    {
      name: 'Dysgraphie (Grapho-moteur)',
      score: 80,
      details: [
        'Irrégularité marquée de la taille des lettres',
        'Lignes non respectées (mots flottants)',
        'Signes de forte pression sur le stylo'
      ]
    }
  ],
  recommendations: [
    "Une évaluation orthophonique complète est fortement recommandée pour approfondir les suspicions de dyslexie.",
    "Mettre en place des exercices de conscience phonologique ciblés.",
    "Proposer des textes adaptés avec une police aérée pour réduire l'effort cognitif lors de la lecture."
  ]
};
