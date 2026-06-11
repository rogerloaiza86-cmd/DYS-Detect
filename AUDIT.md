# Audit complet — Geronimo Éclaireur

**Date : 11 juin 2026** · Codebase : ~3 200 lignes · Périmètre : structure, sécurité, pertinence pédagogique, avancement.

---

## 1. Avancement global : **≈ 90 %**

| Domaine | Poids | Avancement | Détail |
|---|---|---|---|
| Cœur fonctionnel (capture → analyse → résultats) | 35 % | 95 % | Fonctionnel de bout en bout, fallbacks mock |
| Gestion élèves & suivi longitudinal | 10 % | 95 % | CRUD, filtres, graphiques, consentements |
| Exports (PDF, ESS, CSV/JSONL recherche) | 10 % | 90 % | Pseudonymisation OK, filtre consentement OK |
| Identité & page d'accueil | 5 % | 100 % | ✅ Charte v1.0 appliquée, accueil créé (ce commit) |
| Authentification & multi-tenant | 15 % | 90 % | ✅ Supabase Auth + page /login + garde portail (Phase A) |
| Sécurisation (RLS, rate limiting, validation serveur) | 10 % | 90 % | ✅ Migration v4 RLS par enseignant, rate limiting, validation serveur |
| Tests automatisés & CI/CD | 10 % | 80 % | ✅ Vitest (24 tests cœur métier) + CI GitHub Actions (lint/typecheck/tests/build) |
| Analyse vidéo (Phase 3) | 5 % | 15 % | Interfaces + migration prêtes, extraction mock |

---

## 2. Structure

**Architecture saine** : Next.js 16 App Router, TypeScript strict, Tailwind v4.

- `/` — page d'accueil publique (nouvelle, hors AppShell)
- `(portail)/` — groupe de routes avec AppShell : `dashboard`, `new-analysis`, `students`, `students/[id]`, `results/[id]`, `research`, `help`
- `api/` — 6 routes : `transcribe`, `analyze`, `extract-features`, `extract-audio-features`, `extract-video-features` (stub), `export-training-data`
- `lib/` — store Supabase, types, features algorithmiques, prompts modulaires (dys/tdah/tsa/video), banque de 40+ textes, profils de référence ULIS, exports

**Points forts** : multimodalité complète (audio + image + features objectives), système de profils de référence ULIS, banque de textes graduée CP-4e.
**Points faibles** : fichiers de build/lint commités à la racine (`build.log`, `eslint_report*.json`, `lint_output.txt`…), README désormais corrigé.

## 3. Sécurité

| # | Constat | Gravité | Fichier |
|---|---|---|---|
| S1 | ~~Policies RLS publiques~~ → **corrigé** : policies par enseignant (`teacher_id = auth.uid()`), à appliquer via `supabase_migration_v4_auth.sql` | ✅ Réglé | `supabase_migration_v4_auth.sql` |
| S2 | ~~Aucune authentification~~ → **corrigé** : Supabase Auth (e-mail/mot de passe), page `/login`, garde sur le portail, jeton vérifié côté serveur | ✅ Réglé | `src/lib/auth.ts`, `src/lib/api-auth.ts`, `src/app/login` |
| S3 | ~~Pas de rate limiting~~ → **corrigé** : fenêtre glissante par IP sur les 6 routes (in-memory ; passer à Upstash/Redis en multi-instances) | ✅ Réglé | `src/lib/rate-limit.ts` |
| S4 | ~~Validation serveur partielle~~ → **corrigé** : tailles max (audio 25 Mo, image 5 Mo, vidéo 100 Mo), MIME, longueur transcription, bornes d'âge | ✅ Réglé | `src/app/api/*` |
| S5 | ~~Headers de sécurité absents~~ → **corrigé** (X-Frame-Options, nosniff, HSTS, Permissions-Policy) | ✅ Réglé | `next.config.ts` |
| S6 | ~~`.env.example` absent~~ → **corrigé** | ✅ Réglé | `.env.example` |
| S7 | Noms d'élèves stockés en clair (les exports recherche sont pseudonymisés P001…) | 🟡 Moyen | table `students` |

**Points positifs** : aucune clé API hardcodée, `.env*` ignoré par git, consentement RGPD tracé (`consent_audit_log`), exports filtrés sur `consent_status='signed'` et pseudonymisés.

## 4. Pertinence pédagogique

✅ **Solide.** Langage d'orientation partout (« indicateurs de risque », jamais « diagnostic ») ; disclaimers présents sur la page résultats, dans le PDF exporté, la page d'aide et désormais la page d'accueil. Marqueurs DYS/TSA conformes à la littérature (DSM-5/ICD-11) ; profils de référence calculés sur des élèves ULIS aux diagnostics confirmés par des professionnels.

⚠️ Deux vigilances :
1. La classification TDAH 3 sous-profils s'appuie sur *Pan et al., JAMA Psychiatry 2026* — référence très récente, à faire valider par un orthophoniste/neuropsychologue partenaire avant communication.
2. L'analyse vidéo (TSA) repose sur un stub : ne pas activer côté UI tant que MediaPipe n'est pas intégré.

---

## 5. Feuille de route vers 100 %

### Phase A — Sécurisation (bloquant production) · ✅ TERMINÉE

> Action manuelle restante : exécuter `supabase_migration_v4_auth.sql` dans Supabase > SQL Editor et activer le provider Email (Authentication > Providers).
- [x] **A1.** Authentification Supabase Auth (comptes enseignants, page /login, garde portail) ✅
- [x] **A2.** Policies RLS par enseignant (`supabase_migration_v4_auth.sql` — à exécuter dans Supabase) ✅
- [x] **A3.** Rate limiting par IP sur les 6 routes API ✅
- [x] **A4.** Validation serveur : tailles max, contrôle MIME, bornes d'âge ✅

### Phase B — Qualité & industrialisation · ✅ TERMINÉE
- [x] **B1.** Tests unitaires Vitest : `features`, `rate-limit`, `prompts/builder`, `texts-bank` (24 tests) ✅
- [x] **B2.** CI GitHub Actions : lint + typecheck + tests + build (`.github/workflows/ci.yml`) ✅
- [x] **B3.** Repo nettoyé (artefacts de build/lint supprimés et ignorés) + 0 erreur ESLint sur tout le projet ✅
- [x] **B4.** Timeouts 60 s sur les appels Gemini/Claude, réponse 504 dédiée ✅
- [x] **B5.** Vérification responsive (390 px) : accueil et portail OK ✅

### Phase C — Expérience produit · ✅ TERMINÉE
- [x] **C1.** Page d'accueil publique conforme à la charte ✅ (ce commit)
- [x] **C2.** Rebranding complet « Geronimo Éclaireur » + nouvelle charte graphique ✅ (ce commit)
- [x] **C3.** Centre de notifications avec état lu/non-lu persisté et « Tout marquer comme lu » (e-mails : non inclus, voir reste à faire) ✅
- [x] **C4.** Logo SVG définitif (enfant + étoile + vague) sur accueil/portail/login + favicon `icon.svg` ✅
- [x] **C5.** Pages `/mentions-legales` et `/confidentialite` (RGPD), liées au footer — champs éditeur à compléter ✅

### Phase D — Phase 3 vidéo (optionnel, après MVP) · ~10-15 j
- [ ] **D1.** Intégration MediaPipe Holistic dans `api/extract-video-features` (regard, clignements, stéréotypies)
- [ ] **D2.** Validation clinique des marqueurs vidéo avec un partenaire CRA

**Reste à faire pour 100 %** : élargir la couverture de tests (store, routes API), notifications par e-mail (optionnel), compléter les champs éditeur des mentions légales, faire valider la classification TDAH par un professionnel partenaire — puis Phase D (vidéo MediaPipe) après le MVP. **Estimation : ~2-3 jours hors Phase D.**
