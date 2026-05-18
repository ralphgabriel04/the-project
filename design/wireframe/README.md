# wireframe/

Wireframes bruts pour Cadence — la premiere etape du pipeline design.

## Workflow

```
wireframe/ (ici)          →  design/ (parent)
Wireframes HTML bruts        Designs finaux (Claude Design / Figma)
Structure, layout, flow      Couleurs, typo, polish, interactions
```

1. Creer le wireframe HTML dans `wireframe/{platform}/{persona}/{page}/`
2. Valider le layout et le flow avec Ralph
3. Convertir en design final via Claude Design ou Figma
4. Placer le design final dans `design/{platform}/{persona}/{page}/`

## Architecture

Miroir exact de `design/` :

```
wireframe/
├── mobile/
│   ├── athlete/          # 7 pages
│   ├── coach/            # 10 pages
│   └── shared/           # 5 pages
├── web/
│   ├── athlete/          # 4 pages
│   ├── coach/            # 6 pages
│   └── shared/           # 3 pages
└── README.md
```

## Contenu d'un dossier wireframe

```
wireframe/mobile/coach/programmes/creation/
├── README.md                    # Statut, notes wireframe
└── ajouter-une-seance.html      # Wireframe HTML
```

## Statuts

| Icone | Statut | Description |
|-------|--------|-------------|
| ⚪ | Pas commence | Dossier vide |
| 🟡 | En cours | Wireframe en developpement |
| 🟢 | Valide | Wireframe approuve, pret pour conversion design |
| 🔵 | Converti | Design final genere dans design/ |
