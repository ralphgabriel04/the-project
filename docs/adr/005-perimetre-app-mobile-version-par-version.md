# ADR-005 : Perimetre = toute l'app mobile (athlete et coach), livree version par version

**Date :** 2026-10-01 (decision) · 2026-10-13 (redaction)
**Statut :** Accepte (decision de Ralph Christian Gabriel du 2026-10-01) ; section 4 « Serie unique d'ADR » : Propose
**Decideur :** Ralph Christian Gabriel · **Relecture :** Alexandre Boisvert (a faire dans cette PR)
**Remplace :** ADR-003 section 2 (perimetre Phase 1-lite, dont la liste « Hors scope 2026 ») et section 5 (ordre de priorite)
**Conserve :** ADR-001 (athlete d'abord, Mom Test coach avant le code coach), ADR-002 (early-access du 31 decembre 2026), ADR-003 sections 3 (web/app gele) et 4 (schema canonique)

Legende : **Fait** = verifiable dans les depots ou les issues ; **Hypothese** = a confirmer ; **Recommandation** = proposition motivee.

---

## Contexte

- **Fait.** ADR-003 (2026-08-17) a declenche le kill switch d'ADR-002 : Phase 2 coach reportee a 2027, Phase 1 reduite en « Phase 1-lite », avec une liste de coupes (builder personnel, analytics, calendrier, referral, toute la Phase 2 coach, phases web). Source : `docs/adr/003-declenchement-kill-switch-phase-1-lite.md` (PR #226, ouverte, non fusionnee au 2026-10-13).
- **Fait.** ADR-003 prevoyait une revue le 2026-10-05. Aucune trace ecrite de cette revue n'existe dans le depot.
- **Fait.** Le 2026-10-01, les fondateurs ont decide de ne plus raisonner en « liste de coupes » mais en **perimetre complet livre version par version** : toute l'application mobile, cote athlete et cote coach. Seul le web est hors perimetre.
- **Fait.** Deux series d'ADR se chevauchent : `the-project/docs/adr/` (001, 002, 003 en PR) et `cadence-mobile/docs/` (ADR-001 auth, ADR-002 schema de base, ADR-003 structure, ADR-004 schema canonique sur une branche non encore fusionnee). Le meme numero designe deux documents differents.
- **Fait.** ADR-001 exige la validation Mom Test des coachs avant la Phase 2 coach ; ce travail est suivi dans l'issue tp#12.

## Decision

### 1. Perimetre
Le produit est **toute l'application mobile Cadence**, espace athlete et espace coach. Il est livre **version par version** (v0.x, puis v1.0, v1.1, ...), chaque version etant utilisable et testee sur telephone avant la suivante.

**Hors perimetre :** le web. `web/app` reste **gele comme specification de reference** (ADR-003, section 3, inchange) : on le lit, on ne le modifie pas, on ne le livre pas.

### 2. Ce que cette ADR remplace dans ADR-003
- La table « Hors scope 2026 » d'ADR-003 ne s'applique plus : les elements coupes (builder personnel, analytics, calendrier, referral, espace coach) redeviennent **du perimetre**, places dans une version ulterieure plutot qu'exclus.
- L'ordre de priorite de la section 5 d'ADR-003 est remplace par la carte des versions, tenue dans le tableau du projet et revue a chaque fin de version.
- Le reste d'ADR-003 reste en vigueur : kill switch constate, `web/app` gele, schema `cadence-mobile` canonique.

### 3. Garde-fous
1. **Early-access du 31 decembre 2026 (ADR-002) :** son contenu est limite a ce que l'equipe peut livrer **et tester sur telephone** avant cette date. Une fonctionnalite non terminee glisse a la version suivante ; la date ne bouge pas. **Recommandation :** contenu de depart = parcours athlete (connexion, seance du jour, seance en direct, historique, compte et suppression de compte), a confirmer a la planification.
2. **Mom Test coach (ADR-001, tp#12) :** aucun code de l'espace coach avant la fin des entrevues coach et leur synthese ecrite. Lever ce prealable exige une nouvelle ADR.
3. **Taille des livraisons :** une version = un ensemble de PR revues, chacune avec CI verte ; aucune version n'est annoncee sans essai reel sur iOS et Android.
4. **Serie unique d'ADR :** voir section 4 ; toute nouvelle ADR prend le numero suivant de la serie retenue.

### 4. Serie unique d'ADR (Propose : rien n'est acte dans cette section)
- **Option a (Recommandation) :** `the-project/docs/adr/` devient la serie unique des decisions produit et transverses (001 a 005 et suivantes). Les ADR techniques de `cadence-mobile/docs/` gardent leur fichier mais sont referencees dans un index `the-project/docs/adr/README.md` sous un prefixe `MOB-` (MOB-001 auth, MOB-002 schema de base, MOB-003 structure, MOB-004 schema canonique). Avantage : aucun fichier deplace, les liens existants restent valides, un seul index lisible. Limite : deux dossiers physiques.
- **Option b :** tout deplacer dans `cadence-mobile/docs/adr/` et renumeroter. Avantage : un seul dossier, au plus pres du code livre. Limite : renumerotation de 7 documents et liens casses dans les issues.
- **Option c :** nouvelle serie numerotee dans un troisieme emplacement. Rejetee : ajoute un troisieme lieu sans resoudre le doublon.

## Alternatives considerees (sur le perimetre)

### A. Garder la Phase 1-lite et la liste de coupes d'ADR-003
Rejete le 2026-10-01 : une liste de coupes fixe des exclusions sans dire quand elles reviennent, alors que l'espace coach est la raison d'etre du produit (ADR-003, Consequences negatives).

### B. Reprendre le web (web/app) en early-access
Rejete, pour les raisons d'ADR-003 alternative C (pas de CI, pas de tests, second pivot) ; inchange.

### C. Perimetre complet livre d'un bloc
Rejete : meme risque que l'echec d'ADR-002 (tout ou rien a une date fixe). La livraison version par version garde la date et rend le contenu ajustable.

## Consequences

### Positives
- **Recommandation/Hypothese :** l'espace coach redevient un objectif nomme, avec un prealable clair (Mom Test) au lieu d'un report sans date.
- Chaque version est utilisable seule : un retard reduit le contenu d'une version, pas la qualite.
- Le gel de `web/app` et le schema canonique restent stables : aucune remise en cause technique.

### Negatives
- Le perimetre total grandit : sans discipline de version, le risque d'ADR-002 (trop pour la date) revient. Le garde-fou 1 existe pour cela.
- Le contenu exact de l'early-access reste a fixer a la planification (**Hypothese** ci-dessus).
- Tant que la serie unique n'est pas tranchee (section 4), les references « ADR-001 » restent ambigues.

### Neutres
- Les issues coach deja ouvertes restent ouvertes ; leur etiquette « hors 2026 » d'ADR-003 n'est plus requise.

## Suivi
- Fusionner ADR-003 (PR #226) avec la mention « sections 2 et 5 remplacees par ADR-005 » pour garder la trace de la decision du 2026-08-17.
- Trancher la section 4, puis ajouter l'index `docs/adr/README.md`.
- Revue de cette ADR a chaque fin de version, et au plus tard le 2026-12-01 pour figer le contenu de l'early-access.

## Sources
- `docs/adr/001-pivot-4-phases-athlete-first.md`, `docs/adr/002-roadmap-compressee-deadline-decembre-2026.md` (develop, ce33d18).
- `docs/adr/003-declenchement-kill-switch-phase-1-lite.md` (PR #226, branche `docs/adr-003-kill-switch`).
- `cadence-mobile/docs/ADR-001` a `ADR-003` (develop) ; `ADR-004` (branche `chore/223-reset-script-adr`).
- Issue tp#12 (Mom Test coach).
