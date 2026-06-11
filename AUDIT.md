# Audit complet — Geronimo Éclaireur

**Date : 11 juin 2026** · Codebase : ~3 200 lignes · Périmètre : structure, sécurité, pertinence pédagogique, avancement.

---

## 1. Avancement global : **≈ 65 %**

| Domaine | Poids | Avancement | Détail |
|---|---|---|---|
| Cœur fonctionnel (capture → analyse → résultats) | 35 % | 95 % | Fonctionnel de bout en bout, fallbacks mock |
| Gestion élèves & suivi longitudinal | 10 % | 95 % | CRUD, filtres, graphiques, consentements |
| Exports (PDF, ESS, CSV/JSONL recherche) | 10 % | 90 % | Pseudonymisation OK, filtre consentement OK |
| Identité & page d'accueil | 5 % | 100 % | ✅ Charte v1.0 appliquée, accueil créé (ce commit) |
| Authentification & multi-tenant | 15 % | 0 % | Absente — bloquant production |
| Sécurisation (RLS, rate limiting, validation serveur) | 10 % | 25 % | Headers ajoutés (ce commit) ; RLS publiques |
| Tests automatisés & CI/CD | 10 % | 0 % | Aucun test, aucun workflow |
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
| S1 | **Policies RLS Supabase publiques** (`USING (true)`) : lecture/écriture/suppression des données d'élèves mineurs par quiconque possède l'URL | 🔴 Critique | `supabase_migration.sql:40-62`, `_v2.sql:61-70` |
| S2 | **Aucune authentification** : pas d'isolation multi-enseignant | 🔴 Critique | toute l'app |
| S3 | **Pas de rate limiting** sur les routes API → abus possible des quotas Gemini/Claude | 🟠 Haute | `src/app/api/*` |
| S4 | **Validation serveur partielle** : pas de limite de taille audio/image, pas de contrôle MIME côté serveur | 🟠 Haute | `api/transcribe`, `api/analyze` |
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

### Phase A — Sécurisation (bloquant production) · ~5 j
- [ ] **A1.** Authentification NextAuth.js ou Clerk (comptes enseignants) — 3 j
- [ ] **A2.** Remplacer les policies RLS publiques par des policies `auth.uid()` (chaque enseignant ne voit que ses élèves) — 1 j
- [ ] **A3.** Rate limiting sur les 6 routes API (Vercel/Upstash) — 0,5 j
- [ ] **A4.** Validation serveur : taille max audio 50 Mo / image 5 Mo, contrôle MIME, bornes d'âge — 0,5 j

### Phase B — Qualité & industrialisation · ~6 j
- [ ] **B1.** Tests unitaires du cœur métier (`features.ts`, `store.ts`, `prompts/builder.ts`) avec Vitest — 3 j
- [ ] **B2.** CI GitHub Actions : lint + typecheck + tests + build sur chaque PR — 1 j
- [ ] **B3.** Nettoyage du repo : supprimer `build.log`, `build_output*.txt`, `eslint_report*`, `lint_output.txt`, `dashboard.html` racine — 0,5 j
- [ ] **B4.** Timeouts explicites (30 s) et messages d'erreur homogènes sur les appels IA — 1 j
- [ ] **B5.** Audit responsive mobile complet (formulaire new-analysis en priorité) — 0,5 j

### Phase C — Expérience produit · ~4 j
- [x] **C1.** Page d'accueil publique conforme à la charte ✅ (ce commit)
- [x] **C2.** Rebranding complet « Geronimo Éclaireur » + nouvelle charte graphique ✅ (ce commit)
- [ ] **C3.** Notifications réelles (centre de notifications actionnable, e-mail optionnel) — 2 j
- [ ] **C4.** Logo SVG définitif (enfant + étoile + vague de la charte) en remplacement du mark provisoire, favicon assorti — 1 j
- [ ] **C5.** Pages publiques complémentaires : mentions légales, politique de confidentialité RGPD — 1 j

### Phase D — Phase 3 vidéo (optionnel, après MVP) · ~10-15 j
- [ ] **D1.** Intégration MediaPipe Holistic dans `api/extract-video-features` (regard, clignements, stéréotypies)
- [ ] **D2.** Validation clinique des marqueurs vidéo avec un partenaire CRA

**Estimation : ~15 jours de développement pour atteindre 100 % du MVP production-ready (hors Phase D).**
