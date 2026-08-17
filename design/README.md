# design/ — Guide pour Alexandre

Salut Alex! Ce dossier est ton espace de travail pour les maquettes de Cadence.
Voici tout ce que tu dois savoir pour naviguer, ajouter tes wireframes et les
pousser sur GitHub.

---

## Architecture du dossier design

Le dossier est organise en 5 sections principales :

```
design/
├── mapping-coach/                          << MAPPING FONCTIONNEL COACH
│   ├── 00_Design-System/                   # Couleurs, typo, composants, icones, tokens
│   ├── 01_Authentication/                  # Connexion, inscription, onboarding (4 etapes)
│   ├── 02_Accueil/                         # Hub principal coach
│   ├── 03_Athletes/                        # Individuels + Groupes (coeur de l'app)
│   │   ├── 01_Individuels/                 # Vue liste, ajout, apercu, historique, programmes, notes
│   │   └── 02_Groupes/                     # Vue groupes, creation, membres, programmes, notes
│   ├── 04_Seances/                         # Live, modification, ajout, suppression, bottom sheet
│   ├── 05_Construction-Seance/             # Sport, musculation, mobilite, blocs
│   ├── 06_Duplication/                     # Dupliquer vers athlete ou groupe
│   ├── 07_Live/                            # Module live (a detailler)
│   ├── 08_Planification/                   # Module planification (a detailler)
│   ├── 09_Profil-Coach/                    # Module profil coach (a detailler)
│   ├── 10_Flows-Userflows/                 # Diagrammes de flux
│   └── 11_Assets-Resources/                # Illustrations, photos, exports
│
├── mapping-athlete/                        << MAPPING FONCTIONNEL ATHLETE
│   ├── 00_Foundations/                     # Colors, typo, spacing, icono, logo
│   ├── 01_Components/                      # Buttons, inputs, cards, bottom sheets, nav, blocs
│   ├── 02_Authentification/                # Splash, connexion, inscription, onboarding (4 etapes)
│   ├── 03_Accueil/                         # Dashboard + acces rapides
│   ├── 04_Statistiques/                    # Performance, historique (noeud vert)
│   ├── 05_Profil_Athlete/                  # Consultation + edition (noeud turquoise)
│   ├── 06_Programme_Entrainement/          # Liste, modifier, supprimer, commencer, inscrire
│   ├── 07_Creation_Seance/                 # Templates, sport, construction, blocs
│   ├── 08_User_Flows/                      # Diagrammes de flux
│   └── 09_Ressources/                      # FigJam, moodboard, references
│
├── wireframe/                              << WIREFRAMES HTML (Alex travaille ici)
│   ├── mobile/                             # Wireframes mobile par persona
│   └── web/                                # Wireframes web par persona
│
├── mobile/                                 << DESIGNS FINAUX MOBILE (Ralph)
│   └── (meme structure que wireframe/mobile/)
│
├── web/                                    << DESIGNS FINAUX WEB (Ralph)
│   └── (meme structure que wireframe/web/)
│
└── README.md                               # Ce fichier
```

---

## Comment ca marche (le pipeline)

```
TON TRAVAIL                          TRAVAIL DE RALPH
─────────────────────────────────    ─────────────────────────────────
design/wireframe/                →   design/mobile/ ou design/web/
Tu mets tes wireframes HTML ici      Ralph les convertit en design
                                     final avec Claude Design et
                                     les place ici
```

Les dossiers `mapping-coach/` et `mapping-athlete/` servent de **reference
fonctionnelle** : ils decrivent chaque ecran, chaque flux, et chaque composant
a concevoir. Consulte-les pour savoir quoi wireframer.

**En resume :**
1. Consulte `mapping-coach/` ou `mapping-athlete/` pour voir ce qui est attendu
2. Tu crees un wireframe HTML (avec Claude, Figma, ou a la main)
3. Tu le mets dans le bon dossier dans `wireframe/`
4. Tu push sur GitHub
5. Ralph le prend, le convertit en design final, et le met dans le dossier equivalent sous `design/mobile/` ou `design/web/`

---

## Ou mettre tes fichiers wireframe

### Comprendre l'arborescence wireframe

L'architecture wireframe est organisee en 3 niveaux :

```
wireframe / {plateforme} / {persona} / {page ou section}
```

- **Plateforme** : `mobile/` (app React Native) ou `web/` (app Next.js)
- **Persona** : `athlete/`, `coach/`, ou `shared/` (ecrans communs comme login)
- **Page** : le nom de l'ecran en kebab-case francais

### Arborescence wireframe

```
design/wireframe/
├── mobile/
│   ├── athlete/
│   │   ├── accueil/                    # Dashboard athlete
│   │   ├── session-live/
│   │   │   ├── musculation/            # Seance muscu en direct
│   │   │   ├── intervalles/            # HIIT / intervalles
│   │   │   └── distance-temps/         # Course, velo, etc.
│   │   ├── programmes/                 # Programmes assignes
│   │   ├── progression/                # Stats + PRs
│   │   └── settings/                   # Preferences
│   ├── coach/
│   │   ├── accueil/                    # Dashboard coach
│   │   ├── programmes/
│   │   │   ├── liste/                  # Liste des programmes
│   │   │   ├── creation/               # Creer un programme
│   │   │   ├── modification/           # Modifier un programme
│   │   │   └── details-bloc/           # Detail exercice
│   │   ├── athletes/
│   │   │   ├── liste/                  # Liste + invitations
│   │   │   └── profil/                 # Fiche athlete
│   │   ├── calendrier/                 # Vue calendrier
│   │   ├── messages/                   # Messagerie
│   │   └── settings/                   # Preferences coach
│   └── shared/
│       ├── connexion/                  # Login
│       ├── inscription/                # Signup
│       ├── mot-de-passe-oublie/        # Reset password
│       ├── onboarding/                 # Premier lancement
│       └── profil/                     # Profil utilisateur
└── web/
    ├── athlete/
    │   ├── accueil/
    │   ├── entrainement/
    │   ├── progression/
    │   └── messages/
    ├── coach/
    │   ├── accueil/
    │   ├── programmes/
    │   ├── athletes/
    │   ├── calendrier/
    │   ├── messages/
    │   └── settings/
    └── shared/
        ├── connexion/
        ├── inscription/
        └── landing/                    # Page marketing waitlist
```

### Exemple concret

Tu viens de creer un wireframe pour l'ecran de creation de programme du coach
sur mobile. Tu le mets ici :

```
design/wireframe/mobile/coach/programmes/creation/mon-wireframe.html
```

Ralph le prendra et mettra le design final ici :

```
design/mobile/coach/programmes/creation/creation-programme-final.html
```

---

## Quoi mettre dans un dossier

```
design/wireframe/mobile/coach/programmes/creation/
├── README.md                    # Deja la — objectif de la page
├── mon-wireframe.html           # Ton wireframe HTML
├── variante-2.html              # Optionnel : autre version
├── screenshot.png               # Optionnel : capture d'ecran
└── notes.md                     # Optionnel : tes notes de design
```

**Formats acceptes :** `.html`, `.png`, `.jpg`, `.md`
**Formats ignores par git :** `.fig`, `.zip`, `.psd`, `.sketch` (trop lourds)

---

## Comment pousser tes fichiers sur GitHub (pas a pas)

### Prerequis (une seule fois)

```bash
# 1. Installe Git si pas deja fait
# Sur Mac : brew install git
# Sur Windows : https://git-scm.com/download/win

# 2. Clone le repo (une seule fois)
git clone https://github.com/ralphgabriel04/the-project.git

# 3. Entre dans le repo
cd the-project
```

### A chaque fois que tu veux ajouter un wireframe

```bash
# 1. Assure-toi d'etre a jour
git pull origin main

# 2. Navigue vers le bon dossier
# Exemple : wireframe pour l'accueil coach mobile
cd design/wireframe/mobile/coach/accueil/

# 3. Copie/deplace ton fichier HTML ici
# (avec le Finder/Explorateur ou en ligne de commande)
cp ~/Desktop/accueil-coach.html .

# 4. Reviens a la racine du projet
cd ../../../../../..
# OU plus simple :
cd "C:\Users\ralph\OneDrive\Documents\GitHub\the-project"   # Windows
cd ~/Documents/GitHub/the-project                             # Mac

# 5. Verifie ce qui a change
git status

# 6. Ajoute tes fichiers
git add design/wireframe/

# 7. Cree un commit avec un message clair
git commit -m "feat(design): ajouter wireframe accueil coach mobile"

# 8. Pousse sur GitHub
git push origin main
```

### Raccourci rapide (copier-coller)

```bash
git pull origin main
git add design/wireframe/
git commit -m "feat(design): ajouter wireframe [NOM DE LA PAGE]"
git push origin main
```

### Messages de commit — convention

Utilise ce format : `feat(design): [ce que tu as fait]`

Exemples :
- `feat(design): ajouter wireframe accueil coach mobile`
- `feat(design): ajouter wireframe session live musculation`
- `feat(design): mettre a jour wireframe inscription`
- `feat(design): ajouter variante 2 calendrier coach`

---

## Commandes Git utiles

| Commande | Ca fait quoi |
|----------|-------------|
| `git status` | Voir quels fichiers ont change |
| `git pull origin main` | Recuperer les derniers changements |
| `git add design/wireframe/` | Preparer tes fichiers pour le commit |
| `git commit -m "message"` | Sauvegarder tes changements localement |
| `git push origin main` | Envoyer sur GitHub |
| `git log --oneline -5` | Voir les 5 derniers commits |
| `git diff` | Voir ce qui a change dans les fichiers |

### Si tu as un probleme

```bash
# Annuler les changements pas encore commites
git checkout -- .

# Voir sur quelle branche tu es
git branch

# Si tu n'es pas sur main
git checkout main
```

---

## Statuts dans les README

Chaque dossier de page a un README.md avec un statut. Tu peux le mettre a
jour quand tu travailles dessus :

| Icone | Statut | Quand l'utiliser |
|-------|--------|-----------------|
| ⚪ | Pas commence | Dossier vide, rien fait encore |
| 🟡 | En cours | Tu travailles sur le wireframe |
| 🟢 | Valide | Ralph et toi avez approuve |
| 🔴 | A revoir | Ralph a donne du feedback |
| 🔵 | Converti | Ralph a cree le design final |

Pour changer le statut, ouvre le README.md du dossier et remplace la ligne :
```
**Statut :** ⚪ Pas commence
```
par :
```
**Statut :** 🟡 En cours
```

---

## Fichiers deja presents (wireframes existants)

Ces wireframes existent deja dans `wireframe/` :

| Page | Fichier | Statut |
|------|---------|--------|
| Coach > Programmes > Creation | `ajouter-une-seance.html` | 🟡 |
| Coach > Programmes > Details bloc | `details-du-bloc.html` | 🟡 |
| Coach > Programmes > Liste | `programme.html` | 🟡 |
| Athlete > Session live > Musculation | `live-session-musculation.html` | 🟡 |
| Athlete > Session live > Intervalles | `live-session-intervalles.html` | 🟡 |
| Athlete > Session live > Distance/Temps | `live-session-distance-temps.html` | 🟡 |

---

## Questions?

Ecris a Ralph sur Discord ou ouvre une issue sur GitHub.
