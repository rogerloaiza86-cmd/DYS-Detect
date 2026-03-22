/**
 * Marqueurs TSA — Prosodie, Pragmatique, Lexique
 */
export function getTsaPrompt(hasAudioMetadata: boolean): string {
  return `
## Troubles du Spectre Autistique / TSA (catégorie: "TSA")

Analyse les marqueurs suivants :

1. **Prosodie** — subcategory: "prosodie"
   - Intonation monotone ou mécanique (voix "plate")
   - Rythme de parole inhabituellement régulier ou saccadé
   - Absence de variation émotionnelle dans la voix
   - Accentuation atypique des mots ou syllabes
   ${hasAudioMetadata ? `- Variance de hauteur (pitch) faible = monotonie
   - Rythme très régulier (machine-like) ou très irrégulier` : ''}

2. **Pragmatique du langage** — subcategory: "pragmatique"
   - Langage très littéral, absence de figures de style ou d'humour
   - Réponses hors contexte social (techniquement correctes mais socialement inadaptées)
   - Absence de connecteurs de discours (donc, alors, parce que, du coup)
   - Difficulté à prendre la perspective de l'interlocuteur
   - Écholalie : répétition verbatim de parties de la question ou de phrases entendues
   - Persévération sur un thème restreint

3. **Diversité lexicale et registre** — subcategory: "lexique"
   - Vocabulaire très spécialisé sur un domaine restreint
   - Registre de langue inadapté à l'âge (trop formel ou trop technique pour un enfant)
   - Ratio type/token anormal (peu de mots différents ou au contraire vocabulaire très riche mais restreint thématiquement)
   - Usage de néologismes ou de mots inventés de façon idiosyncrasique
   - Difficulté avec les pronoms (je/tu inversés, référents ambigus)`;
}
