# ADR-001 : Pivot roadmap en 4 phases sequentielles — Athlete Mobile first

**Date :** 2026-05-18
**Statut :** Accepte
**Decideurs :** Ralph Christian Gabriel, Alexandre Boisvert

## Contexte

La roadmap initiale de Cadence etait une approche mixte coach+athlete simultanee sur 12 sprints.
Apres validation par interviews (Mom Test) de 2 personas athletes (Felix, Xavier) et l'absence
de validation equivalente cote coach, nous decidons de pivoter vers une approche sequentielle
qui priorise la livraison d'une app athlete autonome avant d'ajouter les fonctionnalites coach.

### Problemes identifies avec l'approche precedente

1. **Aucune validation coach** — les personas coach ne sont pas valides par Mom Test
2. **Complexite simultanee** — coder coach+athlete en parallele multiplie les risques
3. **Time-to-market** — une app athlete autonome peut etre shippee plus vite
4. **Risque de construire pour un persona non-valide** — les features coach sont speculatives

### Concurrent direct Phase 1

Hevy (UX athlete #1 mondial). Notre differenciateur Phase 1 = templates Quebec natifs +
francais natif. Le differenciateur "lien coach-athlete" devient un avantage Phase 2.

## Decision

Roadmap en 4 phases sequentielles :

| Phase | Focus | Sprints | Version cible |
|-------|-------|---------|---------------|
| **Phase 1** | Athlete Mobile (autonome, freemium) | A0–A10 (~24 semaines) | v0.1.0 → v1.0.0 |
| **Phase 2** | Coach Mobile (greffe sur app athlete) | C1–C8 | v1.1.0 → v1.4.0 |
| **Phase 3** | Athlete Web | AW1–AW6 | a planifier |
| **Phase 4** | Coach Web | CW1–CW6 | a planifier |

### Phase 1 — Athlete Mobile (detail)

L'athlete peut, SANS aucun coach dans le systeme :
- S'inscrire seul
- Choisir un template Cadence (5x5, PPL, Upper/Lower, programmes Quebec-specifiques)
- OU creer son propre programme via un builder personnel
- Logger ses seances en temps reel (timer, RPE, PRs auto)
- Voir son historique, sa progression, son readiness

| Sprint | Focus | Version |
|--------|-------|---------|
| A0 | Validation et pre-requis | — |
| A1 | Auth + DB + Infra mobile | v0.1.0-alpha.1 |
| A2 | Design System + CI/CD + Landing waitlist | v0.1.0-alpha.2 |
| A3 | Templates Cadence — seed data + selection | v0.2.0-alpha.1 |
| A4 | Builder de programme personnel athlete | v0.2.0-alpha.2 |
| A5 | Training Live Core (Aujourd'hui + Logging + Timer) | v0.3.0-alpha.1 |
| A6 | Training Live Avance (RPE + Historique + PRs auto) | v0.3.0-alpha.2 |
| A7 | Readiness Athlete + Calendrier personnel | v0.4.0-alpha.1 |
| A8 | Analytics et Progression personnelle | v0.5.0-alpha.1 |
| A9 | Onboarding Athlete + Growth → BETA | v1.0.0-beta.1 |
| A10 | Beta Testing + Polish + Release Candidate | v1.0.0-rc.1 / v1.0.0 |

### Phase 2 — Coach Mobile (detail sommaire)

| Sprint | Focus | Version |
|--------|-------|---------|
| C1 | Coach onboarding + invitation athletes existants | v1.1.0-alpha.1 |
| C2 | Programme builder coach (base sur builder athlete) | v1.1.0-alpha.2 |
| C3 | Assignation programmes + lien coach-athlete | v1.2.0-alpha.1 |
| C4 | Dashboard coach + compliance score | v1.2.0-alpha.2 |
| C5 | Communication bidirectionnelle | v1.3.0-alpha.1 |
| C6 | Analytics coach + readiness cote coach | v1.3.0-alpha.2 |
| C7 | Onboarding coach + Growth → BETA coach | v1.4.0-beta.1 |
| C8 | Beta Testing + Polish + Release v1.4.0 | v1.4.0 |

## Alternatives considerees

### A. Continuer la roadmap mixte (12 sprints coach+athlete)
- **Rejete** : risque de construire pour un persona non-valide (coach)
- **Rejete** : complexite simultanee retarde le time-to-market

### B. Coach-first (cibler les coachs d'abord)
- **Rejete** : aucune validation Mom Test pour les coachs
- **Rejete** : marche plus petit, plus difficile a acquerir

### C. Web-first (dashboard web avant mobile)
- **Rejete** : les athletes cibles sont en salle, telephone en main
- **Rejete** : l'experience mobile est le differenciateur UX

## Consequences

### Positives
- On code seulement pour des personas valides (Felix, Xavier)
- Time-to-market plus rapide pour l'App Store / Google Play
- Feedback reel d'athletes avant de construire le cote coach
- Le builder athlete de Phase 1 est reutilisable en Phase 2 pour les coachs
- Les wireframes coach d'Alexandre (Sprint 3 buffer) alimentent directement Phase 2

### Negatives
- Le differenciateur principal ("lien coach-athlete") est retarde de plusieurs mois
- En Phase 1, on compete directement avec Hevy sans differenciateur fort
- Risque de perception "encore une app de tracking" si le marketing ne met pas
  en avant la promesse Phase 2

### Metriques de transition
- **Phase 1 North Star** : WAA (Weekly Active Athletes solo)
  - Cible : quelques milliers de WAA avant Phase 2
- **Phase 2+ North Star** : WACAP (Weekly Active Coach-Athlete Pairs)

### Obligations
- Validation Mom Test coach reste **obligatoire** avant Phase 2
  - Peut se faire en parallele de Phase 1
- Les issues coach existantes restent OPEN, deplacees en milestone Phase 2
