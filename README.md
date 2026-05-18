# Cadence

> Plateforme de coaching sportif bilingue FR/EN — beachhead Quebec (coachs muscu independants + leurs athletes)

## Equipe

| Qui | Role | GitHub |
|-----|------|--------|
| Ralph Christian Gabriel | Dev, Product, Business | [@ralphgabriel04](https://github.com/ralphgabriel04) |
| Alexandre Boisvert | Design, UX/UI, Branding, Marketing | [@abois15](https://github.com/abois15) |

## Structure du monorepo

```
the-project/
├── design/          # Maquettes et wireframes (Alexandre)
├── web/
│   ├── app/         # Dashboard coach/athlete — Next.js 16, Supabase, Stripe
│   └── landing/     # Landing page marketing — Next.js 16, waitlist, analytics
├── mobile/          # Placeholder (code dans cadence-mobile, repo separe)
├── docs/            # Documentation transverse (roadmap, specs, ADRs)
├── supabase/        # Migrations SQL (partagees entre web et mobile)
└── pnpm-workspace.yaml
```

## Stack technique

| Technologie | Usage |
|-------------|-------|
| Next.js 16 | Frontend + API Routes (App Router) |
| TypeScript | Typage strict |
| Tailwind CSS 4 | Styling |
| Supabase | Auth, Database (PostgreSQL), Storage |
| Stripe | Paiements et abonnements |
| Vercel | Deploiement |
| pnpm | Gestionnaire de paquets (workspaces) |
| React Native + Expo SDK 54 | App mobile (repo separe) |

## Demarrage rapide

### Prerequis

- Node.js 18.17+
- pnpm (`npm install -g pnpm`)
- Compte Supabase (gratuit)

### Installation

```bash
git clone https://github.com/ralphgabriel04/the-project.git
cd the-project
pnpm install
```

### Configuration

```bash
# Dashboard (app principale)
cp web/app/.env.example web/app/.env.local
# Remplir les valeurs Supabase + Stripe

# Landing page
cp web/landing/.env.local.example web/landing/.env.local
# Remplir les valeurs Supabase + Resend + PostHog
```

### Lancer en dev

```bash
# Dashboard coach/athlete (port 3000)
pnpm dev:app

# Landing page marketing (port 3000)
pnpm dev:landing

# Raccourci : pnpm dev = pnpm dev:app
```

## Scripts disponibles

```bash
pnpm dev:app       # Dev server dashboard (Turbopack)
pnpm dev:landing   # Dev server landing page
pnpm build:app     # Build production dashboard
pnpm build:landing # Build production landing
pnpm lint          # Lint tous les workspaces
```

## Branches

| Branche | Role |
|---------|------|
| `main` | Production — deploiements Vercel |
| `develop` | Integration — PRs mergees ici avant main |
| `feature/*` | Branches de travail |

## Liens utiles

- [Roadmap produit](docs/FEATURES_ROADMAP.md)
- [Convention design/](design/README.md)
- [App mobile (repo separe)](https://github.com/ralphgabriel04/cadence-mobile)

## License

Proprietaire — Tous droits reserves
