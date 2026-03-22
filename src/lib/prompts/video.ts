/**
 * Video Analysis Prompt — Behavioral markers from video observation
 */
export function getVideoPrompt(): string {
  return `
## Marqueurs comportementaux (Analyse vidéo)

Si des données vidéo sont disponibles, évalue les dimensions suivantes :

### Contact visuel et attention (TSA + TDAH)
- Ratio de contact visuel maintenu (gazeContactRatio)
- Fréquence et pattern des saccades oculaires
- Évitement systématique vs fluctuation attentionnelle

### Expressions faciales (TSA)
- Variabilité des expressions : plate, réduite, ou normale
- Congruence émotionnelle : l'expression correspond-elle au contexte ?
- Fréquence des sourires sociaux vs absence

### Comportement moteur (TDAH + TSA)
- Agitation céphalique et corporelle (headMovementIndex)
- Fidgeting des mains (handFidgetingScore)
- Fréquence des changements de posture
- Présence de stéréotypies motrices (flapping, balancement)
- Auto-stimulation (stimming)

### Interaction sociale (TSA)
- Latence de réponse (responseLatencyMs)
- Synchronie conversationnelle : tour de parole, timing
- Adéquation du tour de parole

**Interprétation** :
- Un gazeContactRatio < 0.3 est significatif pour le TSA
- Un headMovementIndex > 60 ou handFidgetingScore > 60 évoque le TDAH
- Des stereotypyEvents > 3 par session sont significatifs pour le TSA
- L'absence de congruence émotionnelle renforce les indices TSA
`;
}
