# design/

Maquettes et wireframes de Cadence, maintenues par **Alexandre Boisvert** (@abois15).

## Convention

Chaque ecran de l'app a son propre sous-dossier nomme selon le pattern :

```
cadence-{persona}-{page}
```

### Personas

| Persona | Description |
|---------|-------------|
| `coach` | Ecrans visibles par le coach |
| `athlete` | Ecrans visibles par l'athlete |
| `shared` | Ecrans partages (connexion, inscription, settings) |

### Exemples

```
design/
├── cadence-coach-accueil/
├── cadence-coach-programmes/
├── cadence-coach-modification-programme/
├── cadence-athlete-accueil/
├── cadence-athlete-session-live/
├── cadence-athlete-stats/
├── cadence-shared-connexion/
└── cadence-shared-inscription/
```

## Contenu d'un sous-dossier

```
cadence-coach-accueil/
├── README.md           # Obligatoire : statut, designer, description
├── *.html              # Wireframes HTML (generes via Claude ou autre)
├── *.png / *.jpg       # Exports Figma
└── assets/             # Optionnel : icones, images
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
# {Persona} — {Page}

**Statut :** ⚪ Pas commence
**Designer :** @abois15
**Derniere mise a jour :** YYYY-MM-DD
**Lien Figma :** (optionnel)

## Description
Breve description de l'ecran et son role dans le flow.

## Notes
- Decisions de design prises
- Questions ouvertes
```

## Fichiers ignores

Les fichiers `.fig` (Figma natif) et `.zip` (archives) sont ignores par git — trop lourds. Seuls les exports (HTML, PNG, JPG) et les READMEs sont versionnes.

## Workflow

1. Alex cree un sous-dossier avec le naming convention
2. Il ajoute le README avec statut ⚪
3. Il pousse ses wireframes HTML ou exports Figma
4. Il met le statut a 🟡
5. Ralph review et valide (🟢) ou demande des changements (🔴)
6. Une fois 🟢, le dev peut commencer l'implementation
