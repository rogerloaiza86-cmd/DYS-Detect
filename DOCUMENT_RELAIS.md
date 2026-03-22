# Document Relais - DYS-Detect

Ce document a pour but de fournir une visibilité complète sur l'état du prototype logiciel DYS-Detect à la date du **22 Mars 2026**. Il servira de point de départ pour la suite du développement, les tests utilisateurs et la finalisation du produit.

---

## 1. État Actuel du Projet

L'application a été initialisée et développée sur une stack moderne, robuste et performante : **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, et **TypeScript**.

### Fonctionnalités complétées :
- **Dashboard Élèves (`/`)** : Affichage des statistiques clés et de la liste globale des élèves avec un code couleur réactif pour évaluer rapidement les risques. Le nom d'accueil est dynamique (basé sur le profil utilisateur).
- **Formulaire de Nouvelle Analyse (`/new-analysis`)** : Interface multimodale complète intégrant :
  - L'API Web Audio pour enregistrer la voix de l'étudiant directement depuis le navigateur, avec retour visuel du volume en temps réel (waveform animé).
  - Un upload de photo d'écriture manuscrite (optionnel) avec prévisualisation, compression automatique (max 1200px, JPEG 70%) avant envoi à l'IA.
  - Un indicateur de progression en 3 étapes (Capture, Transcription, Analyse IA).
  - Un mécanisme de **retry automatique** en cas d'erreur avec bannière d'erreur et bouton "Réessayer".
- **Gestion des Élèves (`/students`)** : Interface CRUD complète (ajout, modification inline, suppression avec confirmation). Validation de l'âge (3-18 ans).
- **Page des Résultats (`/results/[id]`)** :
  - Restitution du texte lu (Transcription).
  - Graphique Radar interactif (via `recharts`) exposant visuellement le diagnostic sur **5 axes** : Phonologie (Dyslexie), Morphosyntaxe (Dysphasie), Fluence/TDAH, Anxiété (Prosodie) et Dysgraphie (Grapho-moteur).
  - Affichage de l'image d'écriture manuscrite (si fournie lors de l'analyse).
  - Recommandations pédagogiques IA claires et actionnables pour les enseignants.
- **Export PDF** : Intégration de `html2canvas` et `jspdf`. La génération a été encapsulée (lazy loading) afin d'éviter les erreurs lors du rendu côté serveur (SSR). Les enseignants peuvent télécharger une synthèse visuelle de l'analyse, formatée pour l'impression A4.
- **Navigation & UX** :
  - **Sidebar avec lien actif** : La page courante est visuellement mise en évidence dans la navigation latérale (icône remplie + fond bleu).
  - **Recherche fonctionnelle** : La barre de recherche du header filtre les élèves par nom, prénom ou classe, avec un dropdown de résultats en temps réel.
  - **Tooltips** sur les boutons Notifications et Aide (marqués "bientôt").
  - **Profil utilisateur** modifiable (prénom, nom, profession) via modal dans le header.
- **API Routes (Backend)** :
  - `/api/transcribe` : Interroge l'API **Google Gemini 2.0 Flash** pour la transcription audio. Si aucune clé `GEMINI_API_KEY` n'est fournie, elle offre une transcription simulée (Mock Data).
  - `/api/analyze` : Envoie la transcription (+ image optionnelle) à l'API **Anthropic Claude Sonnet 4.6** avec une invite JSON spécialisée pour l'analyse multimodale. Mode "fallback mockup" actif si clé `ANTHROPIC_API_KEY` non valide.
- **Persistance des données** : Les élèves, résultats d'analyses et profil utilisateur sont stockés dans le `localStorage` du navigateur via un module dédié (`src/lib/store.ts`), avec initialisation automatique de données de démonstration au premier chargement.
- **Stabilisation Technique** :
  - Compilation de production (`npm run build`) fonctionnelle à 100%.
  - Erreurs et avertissements ESLint résolus avec succès.

---

## 2. Architecture Technique

### Stack
| Technologie | Version | Rôle |
|---|---|---|
| Next.js | 16.2.0 | Framework fullstack (App Router) |
| React | 19.2.4 | UI |
| TypeScript | strict | Typage |
| Tailwind CSS | v4 | Styling (Material Design 3) |
| recharts | 3.8.0 | Graphique Radar |
| jspdf + html2canvas | 4.2.1 / 1.4.1 | Export PDF |
| @google/generative-ai | 0.24.1 | Transcription audio (Gemini) |
| lucide-react | 0.577.0 | Icônes |

### Architecture des fichiers :
```
src/
├── app/
│   ├── layout.tsx              # Layout racine (metadata + AppShell)
│   ├── page.tsx                # Dashboard
│   ├── globals.css             # Thème Tailwind (Material Design 3)
│   ├── api/
│   │   ├── transcribe/route.ts # API Gemini (audio → texte)
│   │   └── analyze/route.ts    # API Claude (texte+image → diagnostic)
│   ├── new-analysis/page.tsx   # Formulaire d'analyse multimodale
│   ├── students/page.tsx       # Gestion CRUD des élèves
│   └── results/[id]/page.tsx   # Affichage des résultats
├── components/
│   ├── AppShell.tsx            # Shell client (sidebar, header, recherche)
│   ├── AudioRecorder.tsx       # Enregistrement micro + waveform
│   ├── UserProfileHeader.tsx   # Profil utilisateur éditable
│   ├── RadarChartDisplay.tsx   # Graphique radar recharts
│   └── PdfExportButton.tsx     # Bouton export PDF
└── lib/
    ├── types.ts                # Interfaces TypeScript
    ├── store.ts                # Persistence localStorage
    ├── mock-data.ts            # Données de démonstration
    └── export-pdf.ts           # Utilitaire génération PDF
```

### Variables d'environnement (`.env.local`) :
```
GEMINI_API_KEY=your-gemini-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
```

---

## 3. Ce qu'il reste à Finaliser (To-Do List)

### A. Intégration des APIs Réelles
1. Copiez le fichier `.env.local.example` en `.env.local`.
2. Insérez de vraies valeurs pour `GEMINI_API_KEY` (Google AI Studio) et `ANTHROPIC_API_KEY` (Anthropic Console).
3. Une fois les clés ajoutées, le code abandonnera automatiquement les données _mockées_ (factices) et enverra le flux audio/texte aux vrais modèles d'IA.

### B. Tests Métier (Professeurs ou Testeurs)
- **Fluidité de l'enregistrement** : Le bouton enregistrer (`AudioRecorder.tsx`) a été testé sur Desktop. Pensez à vérifier l'autorisation du microphone sur terminaux mobiles ou tablettes Android/iPadOS.
- **Pertinence du Prompt IA** : Le modèle Claude est configuré dans `api/analyze/route.ts`. Analysez quelques résultats en _live_ pour voir si les "scores" sont crédibles, puis ajustez le prompt en conséquence.
- **Upload d'écriture** : Tester avec des photos de qualité variable (lumière, angle). La compression automatique à 1200px devrait limiter les problèmes de taille.

### C. Connecter une Vraie Base de Données
Actuellement, les données sont stockées dans le `localStorage` du navigateur (module `src/lib/store.ts`).
- **Prochaine étape** : Intégrer un ORM (comme _Prisma_ ou _Drizzle_) et une base relationnelle (ex: PostgreSQL via Supabase) pour stocker pérennement la liste de l'école et l'historique de chaque enfant.
- **Authentification** : Protéger le Dashboard avec un module comme `NextAuth.js` (ou `Clerk`) afin qu'un professeur ne voie que ses propres élèves.

### D. Fonctionnalités Futures
- **Notifications** : Implémenter le système de notifications (alertes pour les élèves à risque, rappels de tests périodiques).
- **Aide en ligne** : Ajouter un guide d'utilisation ou une FAQ intégrée.
- **Pagination** : Ajouter la pagination sur la liste des élèves pour supporter des écoles avec beaucoup d'effectifs.
- **Responsive mobile** : Adapter la sidebar en menu burger pour les écrans < 768px.

---

## 4. Guide de Démarrage Rapide

Pour lancer en développement depuis le terminal :
```bash
npm install     # S'assurer que tout est à jour
npm run dev     # Lance un serveur local sur http://localhost:3000
```

Pour générer un build de production :
```bash
npm run build
npm start
```

---

## 5. Changelog des Corrections (22 Mars 2026)

| Correction | Détail |
|---|---|
| Navigation active | La sidebar indique visuellement la page courante |
| Recherche fonctionnelle | Filtrage des élèves en temps réel depuis le header |
| Profil dynamique | Le dashboard affiche le nom du profil utilisateur (modifiable) |
| Validation d'âge | Contrainte 3-18 ans (HTML + JS) sur tous les formulaires |
| Compression d'image | Les photos d'écriture sont compressées (1200px, JPEG 70%) avant envoi à Claude |
| Retry sur erreur | Bannière d'erreur avec bouton "Réessayer" au lieu d'un simple `alert()` |
| Modèle Claude mis à jour | Passage de `claude-3-5-sonnet-20241022` à `claude-sonnet-4-6-20250320` |
| Tooltips boutons | Les boutons Notifications et Aide affichent des tooltips "bientôt" |
| Document relais | Mise à jour complète pour refléter l'état réel du code |

---
**Le produit est stable et reflète toutes les demandes des couches 1 à 5, avec les corrections de la revue du 22 Mars 2026.**
