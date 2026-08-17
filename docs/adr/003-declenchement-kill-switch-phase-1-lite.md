# ADR-003 : Declenchement du kill switch, Phase 1-lite et schema canonique

**Date :** 2026-08-17
**Statut :** Accepte
**Decideurs :** Ralph Christian Gabriel, Alexandre Boisvert
**Complemente :** ADR-001 (pivot 4 phases), ADR-002 (roadmap compressee)
**Declenche :** la clause kill switch d'ADR-002

---

## Contexte

ADR-002 fixait une roadmap de 29 semaines : Phase 1 du 25 mai au 5 octobre 2026,
Phase 2 du 5 octobre au 14 decembre, early-access le 31 decembre 2026.

Elle contenait une clause explicite :

> Si Phase 1 glisse de plus de 2 semaines : on shippe Phase 1 only le 31 dec,
> Phase 2 en Q1 2027.

L'audit du 17 aout 2026 etablit les faits suivants.

| | Prevu au 17 aout | Reel |
|---|---|---|
| Sprint en cours | A7 (readiness + calendrier) | A0 non clos (#191 ouverte, gates non cochees) |
| Version livree | v0.4.0-alpha.1 | aucune — 0 tag, 0 release |
| Sprints livres depuis le 25 mai | 6 | 0 |
| Dernier commit de code applicatif | — | **2 mai 2026** (107 jours) |

Autres constats de l'audit qui pesent sur la decision :

1. **Deux schemas Supabase divergents.** `the-project/supabase/` : 13 migrations,
   14 tables, 75 policies RLS. `cadence-mobile/supabase/` : 3 migrations, 15 tables,
   30 policies, dont un `000_reset_schema.sql` destructif.
   `cadence-mobile/src/types/database.ts` est un stub vide, ce qui force un `as any`
   dans `auth-provider.tsx` malgre `no-explicit-any: "error"`.
2. **`pnpm type-check` est rouge** sur `cadence-mobile` (cm#100). La CI ne produit
   plus de signal fiable.
3. **`web/app`** est une application Next.js de ~94 fichiers TS, largement
   implementee (66 Ko de Server Actions), rendue orpheline par ADR-001 sans
   decision ecrite.
4. **L'effort design est alle sur la Phase 2.** Sur 33 wireframes mobile :
   23 coach, 5 athlete, 5 partages. L'ecran « Aujourd'hui » athlete — le coeur de
   la Phase 1 — n'a pas de wireframe.

Il reste **136 jours (19,4 semaines)** au 17 aout pour un plan qui en demandait 29
et qui n'a pas commence.

---

## Decision

### 1. Le kill switch d'ADR-002 est declenche

**La Phase 2 (Coach Mobile, sprints C1-2 a C8) est reportee a 2027.** Elle ne fait
plus partie de l'engagement du 31 decembre 2026.

Consequence : les issues portant le label `phase-2: coach-mobile` sortent du perimetre
2026. Elles ne sont pas fermees, elles sont explicitement hors-scope.

### 2. La Phase 1 est re-scopee en « Phase 1-lite »

19,4 semaines, deux personnes dont une qui apprend a coder. Le perimetre A0 a A10
complet n'est pas tenable. Perimetre retenu pour la v1.0.0 :

**Dans le scope :**

| Domaine | Issues | Statut |
|---|---|---|
| Auth | cm#1-#7, #34 | fait |
| Design System DS-1 a DS-6 | cm#92-#98 | a faire |
| Schema canonique + types | tp#223 | a faire — bloquant |
| Type-check vert | cm#100 | a faire — bloquant |
| Ecran Aujourd'hui | cm#24, #85, #101, #103, #104, #105 | a faire |
| Logging temps reel + RPE + timer | cm#25, #27, #28, #26 | a faire |
| Historique par exercice + PR auto | cm#29, #31 | a faire |
| Readiness quotidien | cm#30 | a faire |
| Templates Cadence + seed | cm#79, #80 | a faire |
| Profil + Reglages | cm#108-#118 | a faire |
| Onboarding solo | cm#83, cm#119-#123 | a faire |
| Beta + soumission stores | cm#41, #70, #71 | a faire |

**Hors scope 2026 (creative procrastination) :**

| Coupe | Issue | Report |
|---|---|---|
| Builder de programme personnel complet | cm#81 | v1.1 — templates seulement en v1.0 |
| Analytics et graphiques avances | cm#20, #21 | v1.1 |
| Calendrier mensuel athlete | cm#86 | v1.1 |
| Referral athlete-athlete | cm#84 | v1.1 |
| Bibliotheque d'exercices avec filtres | cm#82 | version minimale seulement |
| Toute la Phase 2 coach | cm#8-#19, #22, #33, #48-#50 | 2027 |
| Phases 3 et 4 web | tp#210-#221 | non planifiees |

### 3. `web/app` est gele comme specification de reference

`web/app` n'est ni poursuivi, ni archive, ni supprime. Il est **gele en l'etat** et
documente comme le contrat fonctionnel executable du produit mobile : ses Server
Actions (`programs.ts`, `training.ts`, `readiness.ts`, `messages.ts`) decrivent la
logique metier attendue, et ses types DB sont la reference du domaine.

Regle : on le lit, on ne le modifie pas. Aucun sprint ne lui est alloue en 2026.

### 4. Le schema `cadence-mobile` devient le schema canonique

Le schema de reference du projet est celui de `cadence-mobile/supabase/migrations/`
(15 tables, 8 enums, `session_exercises` normalise), et non celui de
`the-project/supabase/`.

Motif : le produit livre en 2026 est l'application mobile athlete. Le schema mobile
est structurellement plus propre (enums typés, table de jointure `session_exercises`)
et c'est lui qui alimentera les types generes consommes par le code de production.

**Cout assume et explicite :** le schema mobile ne compte que 30 policies RLS contre
75 cote `the-project`. La difference — environ 45 policies, principalement sur les
tables partagees coach/athlete — doit etre portee, adaptee et testee dans le cadre de
tp#223. Ce travail est la raison pour laquelle tp#223 est `size: XL` et
`priority: critical`.

Le `000_reset_schema.sql` reste reserve au developpement local. Aucun `DROP TABLE`
n'est execute sur un environnement contenant des donnees reelles — y compris
`waitlist_subscribers`, qui est en production.

### 5. La Phase 1-lite est priorisee dans cet ordre

1. cm#100 — type-check vert (S)
2. cm#93 — DS-0 prep deps (S)
3. tp#223 — schema canonique + types regeneres (XL) — **le crapaud**
4. cm#92 puis DS-2 a DS-6 (Alexandre)
5. cm#102, #101, #103, #104, #105 — ecran Aujourd'hui
6. cm#25, #27, #28 — logging temps reel

Premier tag vise : **v0.2.0-alpha.1**, a la livraison de l'ecran Aujourd'hui
alimente par des donnees Supabase reelles.

---

## Alternatives considerees

### A. Maintenir Phase 1 + Phase 2 pour le 31 decembre
Rejete. Il faudrait livrer 29 semaines de travail en 19,4, avec un retard de depart
de 12 semaines et zero ligne de code applicatif depuis 107 jours. Maintenir cet
engagement reviendrait a garantir un echec en decembre plutot qu'a l'eviter en aout.

### B. Decaler la deadline du 31 decembre
Rejete pour la meme raison qu'en ADR-002 : le countdown de la landing page est un
engagement public envers la waitlist. Le cout de credibilite d'un report annonce est
superieur au cout d'un perimetre reduit.

### C. Reprendre `web/app` et le sortir en early access web
Considere serieusement — il est a environ 70 % du MVP fonctionnel. Rejete pour 2026 :
il n'a ni CI ni tests, traine un `ignoreBuildErrors: true`, et le remettre en etat
couterait environ 4 semaines qui repousseraient d'autant le mobile. ADR-001 a etabli
que le produit est mobile-first ; revenir sur le web maintenant serait un second pivot
en trois mois. A reconsiderer en 2027 si la traction mobile le justifie.

### D. Garder le schema `the-project` comme canonique
Considere. Avantage : 75 policies RLS deja eprouvees, types TS deja generes, zero
travail de portage. Rejete : le produit de 2026 est le mobile, et faire porter au code
de production un schema concu pour une application gelee aurait cree une dependance
inversee. Le cout des 45 policies a porter est accepte en connaissance de cause.

---

## Consequences

### Positives
- L'engagement du 31 decembre redevient tenable avec une marge reelle.
- Un seul schema, un seul jeu de types, plus de `as any` — les services peuvent etre
  ecrits avec un contrat stable.
- Le perimetre tient dans la capacite reelle de l'equipe, ce qui rend les sprints
  mesurables au lieu d'etre theoriques.
- `web/app` cesse d'etre une ambiguite et devient un actif documentaire.
- Alexandre a un track parallele non conflictuel (DS-1 a DS-6, puis Profil et Reglages)
  qui ne depend pas du schema.

### Negatives
- **La promesse initiale est reduite de moitie.** L'early-access du 31 decembre livre
  un produit athlete solo, sans lien coach. C'est le negatif deja assume par ADR-001 :
  « en Phase 1, on compete directement avec Hevy sans differenciateur fort ».
  Ce risque est desormais etale sur une annee entiere au lieu de trois mois.
- Le differenciateur coach-athlete — la raison d'etre du produit — n'est pas teste
  sur le marche avant 2027.
- 23 wireframes coach realises restent inutilises jusqu'en 2027.
- Le portage de ~45 policies RLS est un cout net qui n'existerait pas avec le schema
  `the-project`.

### Neutres
- Les issues Phase 2 restent ouvertes et labellisees, prêtes a etre reprises.
- Aucune migration destructive n'est appliquee en production.

---

## Suivi

Cette ADR est revue au **5 octobre 2026**. Criteres de revue :

- Si l'ecran Aujourd'hui et le logging temps reel ne sont pas livres et tagues a cette
  date, le perimetre est reduit une seconde fois (coupe de l'onboarding solo et du
  calendrier au profit d'un seul parcours : Aujourd'hui + logging + historique).
- Si la Phase 1-lite est en avance, cm#81 (builder personnel) est le premier candidat
  a la reintegration.

### Actions immediates decoulant de cette ADR

- [ ] Mettre a jour la roadmap #171 avec le perimetre Phase 1-lite et les dates reelles
- [ ] Labelliser `out-of-scope-2026` les issues `phase-2: coach-mobile`
- [ ] Ajouter un avertissement d'obsolescence en tete de `docs/FEATURES_ROADMAP.md`
      (il decrit une roadmap coach + athlete simultanee, contredite par ADR-001)
- [ ] Ajouter un `README.md` dans `web/app/` documentant le gel et son role de reference
- [ ] Reintegrer cm#81 et cm#82 dans l'epic #194 (perdues lors de la fusion A3+A4)
- [ ] Produire le wireframe manquant « Accueil / Aujourd'hui » athlete
- [ ] Activer la protection de branche sur `main` et `develop` des deux repos
