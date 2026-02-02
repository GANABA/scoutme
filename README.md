# ScoutMe

**Plateforme de scouting football connectant les talents africains aux opportunités**

ScoutMe est une application web full-stack qui permet aux joueurs de football de créer des profils professionnels et aux recruteurs de trouver des talents rapidement.

## 🌍 Vision

Résoudre le problème de visibilité des talents dans le football africain en créant un pont digital entre ambition sportive et opportunité professionnelle.

**Marché cible :** Bénin et Afrique de l'Ouest → Afrique entière

## 🛠️ Stack Technique

- **Frontend:** Next.js 14 (App Router) + TypeScript + TailwindCSS
- **Backend:** Node.js + Express.js + Prisma ORM
- **Base de données:** PostgreSQL 15+
- **Déploiement:** Vercel (frontend) + Render (backend + DB)
- **Services tiers:** Cloudinary (photos), Resend (emails)

## 📂 Structure du Projet

```
ScoutMe/
├── frontend/          # Application Next.js
├── backend/           # API Express + Prisma
├── shared/            # Code partagé (types, validations)
├── docs/              # Documentation
│   ├── PRD.md        # Product Requirements Document
│   ├── ARCHITECTURE.md # Architecture technique
│   └── CLAUDE.md     # Guide développement
└── .github/           # CI/CD workflows
```

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 20+ LTS
- PostgreSQL 15+
- npm ou yarn

### Installation

1. **Cloner le projet**

```bash
git clone <repo-url>
cd ScoutMe
```

2. **Backend**

```bash
cd backend
npm install
cp .env.example .env
# Configurer DATABASE_URL et autres variables dans .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Le backend démarre sur `http://localhost:5000`

3. **Frontend**

```bash
cd frontend
npm install
cp .env.example .env.local
# Vérifier NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev
```

Le frontend démarre sur `http://localhost:3000`

## 📖 Documentation

- **[PRD.md](./docs/PRD.md)** - Vision produit, fonctionnalités, business model
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Architecture technique complète
- **[CLAUDE.md](./docs/CLAUDE.md)** - Guide pour développeurs et agents IA
- **[frontend/README.md](./frontend/README.md)** - Documentation frontend
- **[backend/README.md](./backend/README.md)** - Documentation backend

## 🎯 Roadmap

### MVP (Phase actuelle - 8 semaines)

**Objectif :** Validation du concept

- ✅ Setup projet (frontend + backend)
- 🚧 Authentification (JWT)
- 🚧 Profils joueurs (création, édition, visualisation)
- 🚧 Profils recruteurs (avec validation admin)
- 🚧 Recherche de joueurs (filtres de base)
- 🚧 Contact direct (révélation téléphone/email)
- 🚧 Dashboard admin (modération)

**Scope MVP :**
- Gratuit à 100%
- Français uniquement
- Mobile-first responsive
- Vidéos YouTube uniquement

### V1 (Post-MVP)

- Interface bilingue (Français/Anglais)
- Watchlist recruteurs
- Galerie photos joueurs (5 photos)
- Statistiques joueurs
- Notifications email

### V2 (Monétisation)

- Pay-per-boost joueurs (visibilité augmentée)
- Système de crédits recruteurs (accès contacts)
- Messagerie interne
- Annuaire clubs/académies
- Section opportunités (tryouts, sélections)

## 🔒 Sécurité

- Authentification JWT (access + refresh tokens)
- RBAC (Role-Based Access Control)
- Validation stricte des inputs (Zod)
- Rate limiting API
- HTTPS obligatoire (production)
- Conformité RGPD

## 🧪 Tests

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
npm test

# Tests E2E (Playwright)
npx playwright test
```

## 📝 Contribution

1. Créer une branche depuis `develop`
2. Faire vos modifications
3. Suivre les conventions de commit (Conventional Commits)
4. Créer une Pull Request vers `develop`

**Convention de commit :**
```
<type>(<scope>): <description>

feat(auth): add JWT refresh token mechanism
fix(player): correct video URL validation
docs(api): update authentication endpoints
```

## 📄 Licence

UNLICENSED - Propriété de ScoutMe Team

## 🤝 Contact

Pour questions ou support : [À définir]

---

**Version :** 0.1.0 (MVP en développement)
**Dernière mise à jour :** 2026-02-02
