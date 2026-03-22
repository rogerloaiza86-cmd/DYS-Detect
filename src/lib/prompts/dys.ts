/**
 * Marqueurs DYS — Dyslexie, Dysorthographie, Dysphasie, Dysgraphie
 */
export function getDysPrompt(hasImage: boolean): string {
  return `
## Troubles DYS (catégorie: "DYS")

Analyse les marqueurs suivants :

1. **Dyslexie (Phonologie)** — subcategory: "phonologie"
   - Inversions de phonèmes (ex: "cra" → "car")
   - Substitutions de sons proches (ch/s, f/v, t/d, p/b)
   - Confusions de voyelles (a/o, i/u)
   - Omissions de sons en début/milieu/fin de mot

2. **Dysorthographie** — subcategory: "orthographe"
   - Erreurs d'accord sujet-verbe, pluriel, genre
   - Homophones grammaticaux (a/à, et/est, son/sont)
   - Segmentation incorrecte (mots collés ou coupés)
   - Erreurs sur les mots fréquents

3. **Dysphasie (Morphosyntaxe)** — subcategory: "morphosyntaxe"
   - Structures de phrases simplifiées ou agrammatiques
   - Erreurs de conjugaison récurrentes
   - Lexique pauvre ou imprécis pour l'âge
   - Difficultés de dénomination (mots sur le bout de la langue)

${hasImage ? `4. **Dysgraphie (Grapho-moteur)** — subcategory: "graphomoteur"
   - Irrégularité de la taille des lettres
   - Non-respect des lignes et des interlignes
   - Ratures, surcharges, lettres mal formées
   - Lenteur d'écriture visible (lettres tremblantes)
   - Pression inégale du stylo` : ''}`;
}
