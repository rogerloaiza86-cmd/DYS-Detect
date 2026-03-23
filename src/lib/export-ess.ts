import { Student, AnalysisResult, DiagnosticLabel } from './types';

/**
 * Génère un document ESS (Équipe de Suivi de Scolarisation) en texte formaté
 * et déclenche le téléchargement automatique du fichier .txt.
 */
export function exportESS(
  student: Student,
  result: AnalysisResult,
  labels?: DiagnosticLabel[],
): void {
  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const analysisDate = new Date(result.date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const analysisModeLabel: Record<string, string> = {
    dictee: 'Dictée',
    lecture_libre: 'Lecture libre',
    expression_libre: 'Expression libre',
    conversation_guidee: 'Conversation guidée',
  };

  // Compute per-category average scores
  const categories = ['DYS', 'TDAH', 'TSA'] as const;
  const scoresByCategory: Record<string, number[]> = { DYS: [], TDAH: [], TSA: [] };
  for (const marker of result.markers || []) {
    const cat = marker.category || 'DYS';
    if (cat in scoresByCategory) {
      scoresByCategory[cat].push(marker.score);
    }
  }
  const avgScore = (scores: number[]) =>
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  // TDAH subtype scores
  const tdahMarkers = (result.markers || []).filter(m => m.category === 'TDAH');
  const emotionnelScore = tdahMarkers.find(m => m.subcategory === 'emotionnel')?.score ?? 0;
  const impulsifScore = tdahMarkers.find(m => m.subcategory === 'impulsif')?.score ?? 0;
  const inattentifScore = tdahMarkers.find(m => m.subcategory === 'inattentif')?.score ?? 0;
  const hasTdahSubtypes = emotionnelScore > 0 || impulsifScore > 0 || inattentifScore > 0;

  const dominantSubtypeLabel = (() => {
    if (!hasTdahSubtypes) return null;
    const subtypes = [
      { label: 'Émotionnel', score: emotionnelScore },
      { label: 'Impulsif', score: impulsifScore },
      { label: 'Inattentif', score: inattentifScore },
    ].sort((a, b) => b.score - a.score);
    return subtypes[0].score > 0 ? subtypes[0].label : null;
  })();

  // Aménagements par trouble détecté
  const amenagements: string[] = [];
  const dysAvg = avgScore(scoresByCategory['DYS']);
  const tdahAvg = avgScore(scoresByCategory['TDAH']);
  const tsaAvg = avgScore(scoresByCategory['TSA']);

  if (dysAvg > 30) {
    amenagements.push(
      '— Tiers-temps aux évaluations',
      '— Documents en police adaptée (OpenDyslexic ou Arial, taille 14)',
      '— Autorisation du correcteur orthographique',
      '— Éviter la copie au tableau, privilégier les photocopies',
      '— Lecture à voix haute par l\'enseignant lors des consignes',
    );
  }
  if (tdahAvg > 30) {
    amenagements.push(
      '— Place préférentielle en classe (premier rang, près de l\'enseignant)',
      '— Fractionnement des tâches longues en sous-étapes',
      '— Autorisation de pauses courtes et régulières',
      '— Consignes courtes, reformulées et visuelles',
      '— Outils de gestion du temps (minuterie visuelle)',
    );
  }
  if (tsaAvg > 30) {
    amenagements.push(
      '— Emploi du temps visuel affiché (pictogrammes)',
      '— Anticipation des changements de routine',
      '— Espace de travail calme, stimulations sensorielles réduites',
      '— Communication explicite et littérale des consignes',
      '— Accompagnement lors des transitions (récréation, cantine)',
    );
  }
  if (amenagements.length === 0) {
    amenagements.push('— Aucun aménagement spécifique identifié à ce stade.');
  }

  const sep = '─'.repeat(57);

  const lines: string[] = [
    'ÉQUIPE DE SUIVI DE SCOLARISATION (ESS)',
    "Document généré par DYS-Detect — Outil d'aide au repérage précoce",
    `Date : ${today}`,
    '',
    sep,
    '',
    "1. INFORMATIONS DE L'ÉLÈVE",
    `Nom : ${student.firstName} ${student.lastName}`,
    `Classe : ${student.grade} | Âge : ${student.age} ans`,
    `Pôle ULIS : ${student.isUlisStudent ? 'Oui' : 'Non'}`,
    '',
    sep,
    '',
  ];

  // Section 2 : profil clinique confirmé (si labels)
  if (labels && labels.length > 0) {
    lines.push('2. PROFIL CLINIQUE CONFIRMÉ');
    for (const label of labels) {
      const subtypeStr = label.subtype ? ` — ${label.subtype}` : '';
      const severityStr = label.severity ? ` (${label.severity})` : '';
      lines.push(
        `• ${label.disorder}${subtypeStr}${severityStr} — confirmé par ${label.confirmedBy} le ${new Date(label.confirmedDate).toLocaleDateString('fr-FR')}`,
      );
    }
    lines.push('', sep, '');
  }

  // Section 3 : résultats DYS-Detect
  lines.push(
    "3. RÉSULTATS DE L'ANALYSE DYS-DETECT",
    `Date d'analyse : ${analysisDate}`,
    `Mode : ${analysisModeLabel[result.analysisMode || ''] || result.analysisMode || 'Non précisé'}`,
    `Niveau de risque global : ${result.globalRiskLevel}`,
    '',
    'Indicateurs par domaine :',
  );

  for (const cat of categories) {
    const avg = avgScore(scoresByCategory[cat]);
    const screening = result.disorderScreening?.[cat];
    const screeningStr = screening ? ` — ${screening}` : '';
    let line = `[${cat}] Score moyen : ${avg}%${screeningStr}`;
    if (cat === 'TDAH' && hasTdahSubtypes) {
      line += `\n      Sous-scores : Émotionnel ${emotionnelScore}% | Impulsif ${impulsifScore}% | Inattentif ${inattentifScore}%`;
      if (dominantSubtypeLabel) {
        line += `\n      Sous-profil dominant : ${dominantSubtypeLabel}`;
      }
    }
    lines.push(line);
  }

  lines.push('', sep, '');

  // Section 4 : indicateurs détaillés
  lines.push('4. INDICATEURS DÉTAILLÉS');
  const markersByCategory = (result.markers || []).reduce<Record<string, typeof result.markers>>(
    (acc, m) => {
      const cat = m.category || 'DYS';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(m);
      return acc;
    },
    {},
  );

  for (const [cat, markers] of Object.entries(markersByCategory)) {
    lines.push('', `[${cat}]`);
    for (const marker of markers) {
      const subtypeStr = marker.subcategory ? ` (${marker.subcategory})` : '';
      lines.push(`  • ${marker.name}${subtypeStr} : ${marker.score}%`);
      if (marker.details && marker.details.length > 0) {
        for (const detail of marker.details) {
          lines.push(`      - ${detail}`);
        }
      }
    }
  }

  lines.push('', sep, '');

  // Section 5 : orientations pédagogiques
  lines.push('5. ORIENTATIONS PÉDAGOGIQUES PROPOSÉES');
  if (result.recommendations && result.recommendations.length > 0) {
    for (const rec of result.recommendations) {
      lines.push(`• ${rec}`);
    }
  } else {
    lines.push('Aucune orientation proposée.');
  }

  lines.push('', sep, '');

  // Section 6 : aménagements suggérés
  lines.push('6. AMÉNAGEMENTS SUGGÉRÉS');
  for (const am of amenagements) {
    lines.push(am);
  }

  lines.push(
    '',
    sep,
    'AVERTISSEMENT LÉGAL',
    "Ce document est produit par un outil d'aide au repérage précoce et ne constitue",
    'pas un diagnostic médical. Il doit être utilisé comme support de discussion au',
    "sein de l'ESS, en complément des évaluations professionnelles (orthophoniste,",
    'neuropsychologue, médecin scolaire).',
    sep,
  );

  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateSlug = new Date().toISOString().slice(0, 10);
  a.download = `ESS_${student.firstName}_${student.lastName}_${dateSlug}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
