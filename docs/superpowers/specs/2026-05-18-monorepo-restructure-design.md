# Monorepo Restructure — Design Spec

**Date:** 2026-05-18
**Author:** Ralph (with Claude)
**Status:** Approved
**Deadline:** Before meeting 2026-05-29

## Problem

`the-project` repo is a flat Next.js app at root with `cadence-web/` (landing page) as a separate app alongside. No clear separation between design, web apps, mobile, and docs. Alexandre can't push maquettes because there's no `design/` folder. The repo structure doesn't reflect the team's actual concerns.

## Decisions Made

| Decision | Choice |
|----------|--------|
| What goes in `web/` | Both apps: `web/app/` (dashboard) + `web/landing/` (marketing) |
| `DesignClaude/` content | Fresh start in `design/`, `DesignClaude/` stays gitignored |
| `supabase/` location | Stays at root (transversal) |
| Workspace manager | pnpm workspaces (real monorepo) |
| `.env.example` | One per app, not at root |
| Untracked cadence-web files | Commit on main before restructure |
| Branch strategy | Create `develop` from `main`, feature branch from `develop`, PR → `develop` |

## Target Structure

```
the-project/
├── design/                          # Alexandre's maquettes
│   ├── README.md                    # Convention + workflow
│   ├── .gitignore                   # Ignore .fig, .zip
│   └── cadence-{persona}-{page}/    # One dir per screen
│       └── README.md                # Status, designer, notes
├── web/
│   ├── app/                         # Dashboard coach/athlete (ex-root src/)
│   │   ├── src/                     # App Router, components, lib, types
│   │   ├── public/
│   │   ├── package.json             # name: "cadence-app"
│   │   ├── tsconfig.json            # @/* → ./src/*
│   │   ├── next.config.ts
│   │   ├── postcss.config.mjs
│   │   ├── eslint.config.mjs
│   │   └── .env.example
│   └── landing/                     # Landing page (ex-cadence-web/)
│       ├── src/
│       ├── public/
│       ├── package.json             # name: "cadence-landing"
│       ├── DESIGN_PHILOSOPHY.md
│       └── docs/
├── mobile/                          # Placeholder
│   └── README.md
├── docs/                            # Transverse documentation
│   ├── FEATURES_ROADMAP.md
│   └── superpowers/specs/
├── supabase/                        # SQL migrations (unchanged)
├── pnpm-workspace.yaml              # packages: [web/app, web/landing]
├── package.json                     # Root monorepo orchestrator
├── README.md                        # Rewritten
└── .gitignore                       # Updated
```

## Design Convention for `design/`

### Naming: `cadence-{persona}-{page}` (kebab-case)
- Personas: `coach`, `athlete`, `shared`
- Examples: `cadence-coach-accueil`, `cadence-athlete-session-live`, `cadence-shared-connexion`

### Minimal content per page dir:
```
cadence-coach-accueil/
├── README.md       # Status, designer, description, notes
├── *.html          # Wireframes
└── *.png / *.jpg   # Figma exports
```

### Status system:
- ⚪ Pas commence
- 🟡 En cours
- 🟢 Valide
- 🔴 A revoir

### Gitignored in `design/`:
- `*.fig`, `*.zip` (too heavy for git)

## Execution Plan (Approach B — Incremental Safe)

1. Commit prep: stage cadence-web untracked files + deletions on main
2. Create `develop` from main, then feature branch
3. Create empty structure (design/, mobile/) + READMEs
4. `git mv cadence-web` → `web/landing/`
5. Convert web/landing from npm → pnpm
6. `git mv` dashboard (src/, public/, configs) → `web/app/`
7. Adapt paths in web/app/ (tsconfig, package.json name)
8. Create root `pnpm-workspace.yaml` + monorepo `package.json`
9. `pnpm install` — regenerate lockfile
10. Test: `pnpm --filter cadence-app dev` works
11. Write root README + all READMEs
12. Cleanup orphan artifacts

## Risks

- **Vercel deploy breaks on merge** — Root Directory in Vercel settings points to `cadence-web/`. After merge, Ralph must update to `web/landing/` manually.
- **npm → pnpm migration** for landing — may surface dependency resolution differences.
- **`ignoreBuildErrors: true`** in next.config.ts — existing tech debt, not introduced by this PR.
