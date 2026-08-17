# ADR-002 : Roadmap compressee — Phase 1 + Phase 2 avant le 31 decembre 2026

**Date :** 2026-05-19
**Statut :** Accepte
**Decideurs :** Ralph Christian Gabriel, Alexandre Boisvert
**Supersede :** Complemente ADR-001 (pivot 4 phases)

## Contexte

Le countdown sur la landing page engage publiquement Cadence envers sa waitlist :
early-access le 31 decembre 2026. Budget : 226 jours / 32 semaines depuis le 19 mai 2026.

Phase 1 (Athlete Mobile) ET Phase 2 (Coach Mobile) doivent etre livrees avant cette date.

## Decision

Compression de la roadmap en 29 semaines (19 sem Phase 1 + 10 sem Phase 2) :

### Fusions de sprints

| Fusion | Justification | Risque |
|--------|--------------|--------|
| A3 + A4 → A3-4 | Composants programme/seance/exercice partages entre templates et builder | Si mal factorise, C1-2 explose |
| C1 + C2 → C1-2 | Recyclage 80% du builder athlete A3-4 | Depend de la qualite de factorisation A3-4 |
| C3 + C4 → C3-4 | Dashboard + assignation sont interdependants | Scope large — risque 2 semaines |
| C5 + C6 → C5-6 | Communication + analytics sont complementaires | Moins risque — features independantes |

### Timeline

- Phase 1 : 25 mai → 5 octobre 2026 (v1.0.0)
- Phase 2 : 5 octobre → 14 decembre 2026 (v1.4.0)
- Buffer : 17 jours (14 dec → 31 dec)

### Hypotheses critiques

1. Demarrage A0 le 25 mai 2026
2. Mom Test coachs en PARALLELE de A1-A3 (pas sequentiel)
3. Composants programme factorises dans shared/ des A3-4
4. Sprints 2 semaines stricts (8j planifies + 2j buffer)
5. Pas de pivot strategique majeur

### Kill switch

Si Phase 1 glisse de plus de 2 semaines : on shippe Phase 1 only le 31 dec, Phase 2 en Q1 2027.

## Alternatives considerees

### A. Phase 1 only avant le 31 dec, Phase 2 en Q1 2027
- Plus safe mais ne livre que la moitie de la promesse
- Le differenciateur coach-athlete est retarde de 3+ mois

### B. Deadline decalee a mars 2027
- Rejete : engagement public via countdown, cout de credibilite

### C. Equipe agrandie
- Rejete : budget bootstrap, pas de recrutement prevu

## Consequences

### Positives
- Promesse early-access tenue
- Les 2 personas (athlete + coach) livres ensemble
- Le builder athlete A3-4 est reutilise a 80% en C1-2

### Negatives
- 0 marge sur les sprints individuels (buffer global = 17j seulement)
- 3 fusions de sprints augmentent la complexite
- Risque d'architecture : factorisation composants A3-4 est critique path
