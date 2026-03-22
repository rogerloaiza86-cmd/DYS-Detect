/**
 * Marqueurs TDAH — Attention, Impulsivité, Fluence
 */
export function getTdahPrompt(hasAudioMetadata: boolean): string {
  return `
## Troubles de l'Attention / TDAH (catégorie: "TDAH")

Analyse les marqueurs suivants :

1. **Attention / Concentration** — subcategory: "attention"
   - Dégradation progressive de la qualité du texte (début bon, fin chaotique)
   - Omissions de mots entiers (pas de lettres, des mots complets)
   - Phrases inachevées ou abandonnées en cours de route
   - Perte du fil narratif (sauts de coq à l'âne)
   ${hasAudioMetadata ? `- Pauses longues et irrégulières (voir données audio)
   - Ratio de silence élevé par rapport à la durée totale` : ''}

2. **Impulsivité verbale** — subcategory: "impulsivite"
   - Auto-corrections fréquentes et rapides
   - Mots commencés puis remplacés par d'autres
   - Réponses avant la fin de la question (en mode conversation)
   - Phrases commencées sans planification visible
   ${hasAudioMetadata ? `- Débit de parole rapide puis ralentissements brutaux
   - Pauses très courtes entre les mots` : ''}

3. **Fluence et régulation** — subcategory: "fluence"
   - Répétitions de mots ou de syllabes (pas bégaiement, mais relance)
   - Variations de débit inhabituelles
   - Digressions hors sujet
   - Difficulté à revenir au sujet après une interruption
   ${hasAudioMetadata ? `- Nombre de mots par minute anormalement variable
   - Pattern de pauses irrégulier` : ''}`;
}
