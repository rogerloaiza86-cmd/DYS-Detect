# Geronimo Éclaireur ★

> L'éclaireur bienveillant de l'école inclusive — « Aucun enfant n'avance seul. »

Geronimo est un atelier pédagogique d'aide au **repérage précoce** des troubles
DYS, TDAH et TSA, destiné aux enseignants et aux équipes éducatives. L'élève lit,
raconte ou converse ; Geronimo analyse la voix, la transcription et l'écriture
manuscrite pour produire des **indicateurs d'orientation** et des pistes
pédagogiques concrètes.

⚠️ **Geronimo éclaire, il ne diagnostique pas.** Les indicateurs générés ne
constituent pas une évaluation clinique et ne remplacent jamais l'avis d'un
professionnel de santé (orthophoniste, neuropsychologue, médecin).

## Stack

- **Next.js 16** (App Router) · React 19 · TypeScript strict · Tailwind CSS v4
- **Gemini 2.0 Flash** — transcription audio + extraction prosodique
- **Claude Sonnet** — analyse multimodale des marqueurs DYS / TDAH (3 sous-profils) / TSA
- **Supabase** — élèves, résultats d'analyses, labels diagnostiques, audit RGPD
- recharts (radar, longitudinal) · jspdf + html2canvas (rapports PDF)

## Démarrage

```bash
npm install
cp .env.example .env.local   # renseigner les clés API
npm run dev
```

Sans clés API, l'application fonctionne en mode démonstration (données mock).

## Structure

- `/` — page d'accueil publique (charte Geronimo v1.0)
- `/dashboard` — portail enseignant (stats, élèves récents)
- `/new-analysis` — analyse multimodale (4 modes : dictée, lecture, expression, conversation)
- `/students` — gestion des élèves, historique longitudinal
- `/results/[id]` — résultats détaillés, radar, export PDF
- `/research` — agrégats anonymisés et exports d'entraînement (consentement requis)

## Charte graphique

Marine Geronimo `#17314A` · Or Boussole `#F4B942` · Crème Papier `#F7F3EC` —
typographies **Fraunces** (voix) et **Figtree** (information). Voir `AUDIT.md`
pour l'état du projet et la feuille de route.
