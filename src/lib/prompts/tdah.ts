/**
 * TDAH Prompt — 3 sous-profils neurologiques (Pan et al., JAMA Psychiatry 2026)
 * Type 1 : Émotionnel (CPF ventromédian + amygdale)
 * Type 2 : Impulsif (cortex cingulaire antérieur + pallidum)
 * Type 3 : Inattentif (gyrus frontal supérieur) — fréquent chez les filles
 */
export function getTdahPrompt(hasAudioMetadata: boolean): string {
  return `
## Marqueurs TDAH — Classification en 3 sous-profils (Pan et al., JAMA Psychiatry 2026)

Cette étude sur des centaines d'IRM cérébrales identifie 3 profils neurologiques distincts du TDAH, chacun avec des marqueurs vocaux et scripturaux spécifiques détectables sans imagerie.

### Profil 1 : TDAH Émotionnel (CPF ventromédian + amygdale)
**Marqueurs vocaux :**
- Variations brutales de prosodie (volume, débit soudainement élevé ou coupé)
- Interruptions liées à des pics émotionnels (frustration, enthousiasme)
- Vocabulaire émotionnel fort ("j'adore", "c'est horrible", "ça m'énerve")
- Transitions abruptes de sujet déclenchées par une association émotionnelle
- Récit non linéaire : retours en arrière, digressions émotionnellement chargées
**Marqueurs écrits :**
- Ponctuation émotionnelle excessive (!!!), puis absente
- Mots en majuscules pour exprimer l'intensité
- Phrases longues puis très courtes selon l'état émotionnel

### Profil 2 : TDAH Impulsif (cortex cingulaire antérieur + pallidum)
**Marqueurs vocaux :**
- Débit verbal très rapide, densité de mots élevée sur courte durée
- Anticipation de mots → erreurs de substitution lexicale
- Phrases fréquemment inachevées, enchaînement sans pause
- Chevauchements de pensées : commence une phrase avant de finir la précédente
- Quasi-absence de pauses inter-phrases${hasAudioMetadata ? ' (confirmer avec wordsPerMinute > 180 et pauseCount faible)' : ''}
**Marqueurs écrits :**
- Mots fusionnés ou agglutinés (manque de séparation)
- Ponctuation absente ou erratique
- Lettres sautées sous l'effet de la vitesse
- Fin de mot escamotée

### Profil 3 : TDAH Inattentif (gyrus frontal supérieur) — souvent non détecté, fréquent chez les filles
**Marqueurs vocaux :**
- Longues pauses silencieuses en milieu de phrase (≥ 2-3 secondes)${hasAudioMetadata ? ' (confirmer avec maxPauseDurationMs > 2000)' : ''}
- Perte du fil narratif : digression sans retour au sujet initial
- Phrases grammaticalement correctes mais thématiquement discontinues
- Absence de clôture thématique : les sujets sont abandonnés sans conclusion
- Voix monotone, faible énergie, réponses brèves même sur sujets libres
**Marqueurs écrits :**
- Organisation défaillante : idées incomplètes, manque de structure
- Absence d'hyperactivité graphique (pas de ratures ni vitesse)
- Contenu lacunaire malgré une syntaxe correcte

## Instructions de scoring TDAH
Pour chaque sous-profil, attribue un score 0-100 indépendant.
Un enfant peut avoir des scores significatifs sur plusieurs profils (comorbidité intra-TDAH).
Le profil dominant est celui avec le score le plus élevé.
Score > 45 = indicateurs présents, orientation recommandée vers neuropédiatre/neuropsychologue.
Mentionne explicitement si le profil Inattentif est suspecté chez une fille (sous-détection historique importante).
`;
}
