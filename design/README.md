# design/

Maquettes et wireframes de Cadence, maintenues par **Alexandre Boisvert** (@abois15).

## Pipeline design

```
wireframe/  →  design/
(HTML brut)    (design final via Claude Design / Figma)
```

1. Creer un wireframe HTML dans `wireframe/{platform}/{persona}/{page}/`
2. Valider le layout et le flow
3. Convertir en design final (Claude Design ou Figma)
4. Placer le resultat dans `design/{platform}/{persona}/{page}/`

## Architecture

```
design/
├── wireframe/                       # Wireframes HTML bruts (etape 1)
│   ├── mobile/                      # Miroir exact de la structure ci-dessous
│   └── web/
├── mobile/                          # Designs finaux — App React Native (Expo)
│   ├── athlete/                     # Ecrans athlete
│   │   ├── accueil/                 # Dashboard athlete
│   │   ├── session-live/            # Execution d'une seance
│   │   │   ├── musculation/
│   │   │   ├── intervalles/
│   │   │   └── distance-temps/
│   │   ├── programmes/              # Consultation des programmes assignes
│   │   ├── progression/             # Stats et historique
│   │   └── settings/                # Preferences athlete
│   ├── coach/                       # Ecrans coach
│   │   ├── accueil/                 # Dashboard coach
│   │   ├── programmes/              # Gestion des programmes
│   │   │   ├── liste/               # Liste des programmes
│   │   │   ├── creation/            # Creer un programme
│   │   │   ├── modification/        # Modifier un programme
│   │   │   └── details-bloc/        # Detail d'un bloc/exercice
│   │   ├── athletes/                # Gestion des athletes
│   │   │   ├── liste/               # Liste + invitations
│   │   │   └── profil/              # Fiche athlete
│   │   ├── calendrier/              # Vue calendrier
│   │   ├── messages/                # Messagerie coach-athlete
│   │   └── settings/                # Preferences coach
│   └── shared/                      # Ecrans communs aux deux roles
│       ├── connexion/               # Login
│       ├── inscription/             # Signup avec selection de role
│       ├── mot-de-passe-oublie/     # Reset password
│       ├── onboarding/              # Premier lancement
│       └── profil/                  # Profil utilisateur
│
├── web/                             # App Next.js (dashboard)
│   ├── athlete/                     # Dashboard web athlete
│   │   ├── accueil/
│   │   ├── entrainement/
│   │   ├── progression/
│   │   └── messages/
│   ├── coach/                       # Dashboard web coach
│   │   ├── accueil/
│   │   ├── programmes/
│   │   ├── athletes/
│   │   ├── calendrier/
│   │   ├── messages/
│   │   └── settings/
│   ├── shared/                      # Ecrans web communs
│   │   ├── connexion/
│   │   ├── inscription/
│   │   └── landing/                 # Page marketing / waitlist
│   └── README.md
│
└── README.md                        # Ce fichier
```

## Convention de nommage

Les dossiers utilisent le **kebab-case** en francais. Chaque dossier de page
contient un README qui decrit clairement l'objectif de la page.

## Contenu d'un dossier de page

```
design/mobile/coach/programmes/creation/
├── README.md           # Obligatoire : objectif, persona, flow, statut
├── *.html              # Wireframes HTML (generes via Claude ou autre)
├── *.png / *.jpg       # Exports Figma (screenshots)
└── assets/             # Optionnel : icones, images specifiques
```

## Statuts

| Icone | Statut | Description |
|-------|--------|-------------|
| ⚪ | Pas commence | Dossier cree, rien dedans |
| 🟡 | En cours | Wireframes en developpement |
| 🟢 | Valide | Approuve par Ralph + Alex, pret pour dev |
| 🔴 | A revoir | Feedback recu, necessite des changements |

## Template README pour chaque page

```markdown
# [Plateforme] [Persona] — [Page]

**Statut :** ⚪ Pas commence
**Designer :** @abois15
**Derniere mise a jour :** YYYY-MM-DD
**Lien Figma :** (optionnel)

## Objectif
Quel probleme cette page resout pour l'utilisateur. En 1-2 phrases.

## Persona
Qui utilise cette page et dans quel contexte.

## Elements cles
- Liste des composants/sections principaux de la page
- Ce que l'utilisateur peut faire ici

## Flow
D'ou vient l'utilisateur → cette page → ou va-t-il ensuite.

## Notes
- Decisions de design prises
- Questions ouvertes
```

## Fichiers ignores

Les fichiers `.fig` (Figma natif) et `.zip` (archives) sont ignores par git —
trop lourds. Seuls les exports (HTML, PNG, JPG) et les READMEs sont versionnes.

## Workflow

1. Alex cree le dossier de page au bon endroit dans l'arborescence
2. Il ajoute le README avec l'objectif et le statut ⚪
3. Il pousse ses wireframes HTML ou exports Figma
4. Il met le statut a 🟡
5. Ralph review et valide (🟢) ou demande des changements (🔴)
6. Une fois 🟢, le dev peut commencer l'implementation
