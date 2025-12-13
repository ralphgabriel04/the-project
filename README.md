# 🏋️ THE PROJECT

> Athlete-first coaching platform – MVP web app built with Next.js, Supabase & Stripe

## 🎯 Vision

THE PROJECT est une plateforme de coaching sportif intelligent, conçue pour :
- Améliorer la communication coach ↔ athlète
- Rendre les programmes d'entraînement clairs et exécutables
- Offrir un suivi structuré et motivant de la performance

## 🛠️ Stack technique

| Technologie | Usage |
|-------------|-------|
| **Next.js 16** | Frontend + API Routes (App Router) |
| **TypeScript** | Typage strict |
| **Tailwind CSS 4** | Styling |
| **Supabase** | Auth, Database (PostgreSQL), Storage |
| **Stripe** | Paiements & Abonnements |
| **Vercel** | Déploiement |
| **pnpm** | Gestionnaire de paquets |

## 🚀 Getting Started

### Prérequis

- Node.js 18.17+
- pnpm (`npm install -g pnpm`)
- Compte Supabase (gratuit)
- Compte Stripe (mode test)

### Installation

```bash
# Cloner le repo
git clone https://github.com/your-username/the-project.git
cd the-project

# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Remplir les valeurs dans .env.local

# Lancer le serveur de développement
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du projet

```
src/
├── app/                    # App Router (pages, layouts, API routes)
│   ├── (auth)/             # Routes groupées : login, register
│   ├── (dashboard)/        # Routes protégées
│   ├── api/                # Route Handlers
│   ├── layout.tsx          # Layout racine
│   └── page.tsx            # Landing page
├── components/             # Composants UI
│   ├── ui/                 # Design system
│   └── features/           # Composants métier
├── lib/                    # Utilitaires
│   ├── supabase/           # Client Supabase
│   └── stripe/             # Helpers Stripe
└── types/                  # Types TypeScript
```

## 📜 Scripts disponibles

```bash
pnpm dev      # Serveur de développement (Turbopack)
pnpm build    # Build de production
pnpm start    # Serveur de production
pnpm lint     # Linter ESLint
```

## 📄 License

Propriétaire - Tous droits réservés
