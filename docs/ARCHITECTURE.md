# ScoutMe - Architecture technique

**Version :** 1.0
**Date :** 2026-02-01
**Stack :** React/Next.js + Node.js/Express + PostgreSQL

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Stack technique](#stack-technique)
3. [Architecture applicative](#architecture-applicative)
4. [Architecture base de données](#architecture-base-de-données)
5. [Infrastructure et déploiement](#infrastructure-et-déploiement)
6. [Sécurité](#sécurité)
7. [Services tiers](#services-tiers)
8. [Structure des projets](#structure-des-projets)
9. [Workflow de développement](#workflow-de-développement)
10. [Considérations de scaling](#considérations-de-scaling)

---

## 🎯 Vue d'ensemble

ScoutMe est une application web full-stack construite avec une architecture moderne séparant le frontend (Next.js) du backend (Node.js/Express). L'application utilise une base de données PostgreSQL pour stocker les données relationnelles et s'appuie sur des services tiers pour le stockage de médias (Cloudinary) et les paiements (Fedapay, Stripe).

### Diagramme d'architecture global

```
┌─────────────┐
│   Clients   │
│ (Browsers)  │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────────────┐
│   Frontend (Next.js)        │
│   - Pages SSR/SSG           │
│   - React Components        │
│   - TailwindCSS             │
│   Déployé sur: Vercel       │
└──────────┬──────────────────┘
           │ REST API (HTTPS)
           ▼
┌─────────────────────────────┐
│   Backend (Node.js/Express) │
│   - API REST                │
│   - Business Logic          │
│   - Auth JWT                │
│   Déployé sur: Render       │
└──────┬────────┬─────────────┘
       │        │
       │        └─────────────┐
       ▼                      ▼
┌─────────────┐      ┌────────────────┐
│ PostgreSQL  │      │ Services tiers │
│ (Render)    │      │ - Cloudinary   │
└─────────────┘      │ - Resend       │
                     │ - Fedapay      │
                     │ - Stripe       │
                     └────────────────┘
```

---

## 🛠️ Stack technique

### Frontend

**Framework :** Next.js 14+ (React 18+)
- **Justification :** SSR/SSG pour SEO, routing intégré, optimisation automatique, excellente DX
- **Mode de rendu :** Hybride (SSR pour pages dynamiques, SSG pour pages statiques)
- **TypeScript :** Recommandé fortement (typage fort, meilleure maintenabilité)

**Styling :** TailwindCSS v3+
- **Justification :** Utility-first, très flexible, petite taille bundle avec tree-shaking
- **Composants UI :** shadcn/ui (composants React + TailwindCSS, personnalisables)

**State Management :**
- **React Context API** (MVP) - suffisant pour état global simple
- **Zustand** (V1+) - si besoin de state management plus complexe

**Formulaires :** React Hook Form + Zod
- **React Hook Form :** Performance, validation native, moins de re-renders
- **Zod :** Validation schema avec typage TypeScript automatique

**HTTP Client :** Axios ou Fetch API native
- **Axios** si besoin d'interceptors sophistiqués
- **Fetch native** suffisant pour MVP

### Backend

**Runtime :** Node.js 20+ LTS

**Framework :** Express.js v4+
- **Justification :** Mature, grande communauté, middleware riche, flexible
- **Structure :** MVC-like (routes → controllers → services → models)

**Langage :** JavaScript (ou TypeScript recommandé)
- **TypeScript :** Fortement recommandé pour typage partagé avec frontend

**ORM :** Prisma 5+
- **Justification :** Type-safe, migrations automatiques, excellent DX, introspection DB
- **Avantages :**
  - Schema unique (schema.prisma) → génération types TypeScript
  - Prisma Studio pour visualisation DB
  - Migrations versionnées

**Authentification :** JWT (JSON Web Tokens)
- **Librairie :** jsonwebtoken + bcrypt
- **Stratégie :**
  - Access token (15 min expiration)
  - Refresh token (7 jours expiration, stocké en HTTP-only cookie)

**Validation :** Zod (partagé avec frontend)
- **Validation côté serveur obligatoire** même si frontend valide
- Schemas réutilisables entre client et serveur

### Base de données

**SGBD :** PostgreSQL 15+
- **Justification :**
  - Relationnel (structure claire pour joueurs/recruteurs/profils)
  - ACID compliant (transactions fiables)
  - JSON support (stockage video_urls, secondary_positions)
  - Performances excellentes
  - Open source

**Hébergement :** Render PostgreSQL (tier gratuit puis payant)
- **Backups automatiques :** quotidiens (rétention 30 jours)
- **Connexion :** SSL obligatoire

### Services tiers

| Service | Usage | Tier gratuit | Upgrade |
|---------|-------|--------------|---------|
| **Cloudinary** | Stockage photos joueurs | 25 GB storage, 25 GB bandwidth/mois | Payant si dépassement |
| **YouTube** | Hébergement vidéos (MVP) | Illimité | - |
| **Resend** | Emails transactionnels | 3000 emails/mois | $20/mois pour 50k |
| **Fedapay** | Paiements mobile money (V2) | Transaction fees uniquement | Frais par transaction |
| **Stripe** | Paiements cartes bancaires (V2) | Transaction fees uniquement | Frais par transaction |
| **Sentry** | Monitoring erreurs | 5k events/mois | $26/mois |

---

## 🏗️ Architecture applicative

### Principes architecturaux

1. **Séparation Frontend/Backend** - Communication via API REST uniquement
2. **Stateless API** - Backend ne stocke pas de session (JWT dans cookies)
3. **Mobile-first** - Design responsive, priorité mobile (60%+ traffic attendu)
4. **Security by default** - HTTPS obligatoire, validation stricte, RBAC

### Architecture Frontend (Next.js)

**App Router (Next.js 13+)** - Utilisation de la nouvelle architecture

```
frontend/
├── app/
│   ├── (auth)/              # Route group pour pages authentification
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (player)/            # Route group pour joueurs
│   │   ├── dashboard/
│   │   ├── profile/edit/
│   │   └── profile/preview/
│   ├── (recruiter)/         # Route group pour recruteurs
│   │   ├── dashboard/
│   │   ├── search/
│   │   └── watchlist/
│   ├── (admin)/             # Route group pour admins
│   │   ├── dashboard/
│   │   └── moderate/
│   ├── players/[id]/        # Page profil public joueur
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   └── api/                 # API routes (optionnel, pour BFF pattern)
├── components/
│   ├── ui/                  # Composants shadcn/ui
│   ├── forms/               # Composants formulaires
│   ├── layouts/             # Layouts réutilisables
│   └── shared/              # Composants partagés
├── lib/
│   ├── api/                 # Appels API backend
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Fonctions utilitaires
│   └── validations/         # Schemas Zod
├── public/                  # Assets statiques
└── styles/                  # Global CSS, Tailwind config
```

**Patterns clés :**
- **Server Components par défaut** (Next.js 13+) → meilleure performance
- **Client Components** uniquement si interactivité nécessaire (forms, state)
- **API calls côté serveur** quand possible (Server Components) → pas d'exposition clés API
- **Lazy loading** pour images (next/image) et composants lourds

### Architecture Backend (Node.js/Express)

**Structure MVC-like :**

```
backend/
├── src/
│   ├── config/              # Configuration (DB, env, constants)
│   │   ├── database.js      # Prisma client instance
│   │   └── env.js           # Variables d'environnement validées
│   ├── routes/              # Définition des routes
│   │   ├── index.js         # Router principal
│   │   ├── auth.routes.js
│   │   ├── players.routes.js
│   │   ├── recruiters.routes.js
│   │   └── admin.routes.js
│   ├── controllers/         # Logique de traitement des requêtes
│   │   ├── auth.controller.js
│   │   ├── players.controller.js
│   │   ├── recruiters.controller.js
│   │   └── admin.controller.js
│   ├── services/            # Logique métier (business logic)
│   │   ├── auth.service.js
│   │   ├── players.service.js
│   │   ├── recruiters.service.js
│   │   ├── email.service.js
│   │   └── upload.service.js
│   ├── middlewares/         # Middlewares Express
│   │   ├── auth.middleware.js       # Vérification JWT
│   │   ├── rbac.middleware.js       # Contrôle accès rôles
│   │   ├── validate.middleware.js   # Validation Zod
│   │   ├── rateLimiter.middleware.js
│   │   └── errorHandler.middleware.js
│   ├── validators/          # Schemas de validation Zod
│   │   ├── auth.validators.js
│   │   ├── players.validators.js
│   │   └── recruiters.validators.js
│   ├── utils/               # Fonctions utilitaires
│   │   ├── jwt.js
│   │   ├── password.js      # Hash/compare bcrypt
│   │   └── errors.js        # Custom error classes
│   ├── prisma/
│   │   ├── schema.prisma    # Schéma de base de données
│   │   ├── migrations/      # Migrations générées
│   │   └── seed.js          # Données de test
│   ├── app.js               # Configuration Express app
│   └── server.js            # Point d'entrée
├── tests/                   # Tests unitaires et intégration
├── .env.example             # Template variables d'environnement
└── package.json
```

**Flow typique d'une requête :**

```
Client Request
    ↓
Express Router
    ↓
Middleware (auth, validation, etc.)
    ↓
Controller (traite requête HTTP)
    ↓
Service (logique métier)
    ↓
Prisma (accès DB)
    ↓
PostgreSQL
    ↓
Réponse JSON
```

---

## 💾 Architecture base de données

### Schéma relationnel (PostgreSQL)

#### MVP - Tables principales

```sql
-- Table users (authentification)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('player', 'recruiter', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table players (profils joueurs)
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  birth_date DATE NOT NULL,
  nationality VARCHAR(100),
  city VARCHAR(100),
  country VARCHAR(100) NOT NULL,
  primary_position VARCHAR(50) NOT NULL,
  secondary_positions JSONB DEFAULT '[]',
  strong_foot VARCHAR(20) CHECK (strong_foot IN ('left', 'right', 'both')),
  height_cm INTEGER,
  weight_kg INTEGER,
  current_club VARCHAR(255),
  career_history TEXT,
  phone VARCHAR(50),
  profile_photo_url VARCHAR(500),
  video_urls JSONB DEFAULT '[]', -- Max 3 URLs YouTube
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour recherches fréquentes
CREATE INDEX idx_players_country ON players(country);
CREATE INDEX idx_players_primary_position ON players(primary_position);
CREATE INDEX idx_players_status ON players(status);

-- Table recruiters (recruteurs)
CREATE TABLE recruiters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  organization_name VARCHAR(255) NOT NULL,
  organization_type VARCHAR(50) NOT NULL CHECK (organization_type IN ('club', 'academy', 'agency', 'other')),
  country VARCHAR(100) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour modération
CREATE INDEX idx_recruiters_status ON recruiters(status);
```

#### V1 - Tables additionnelles

```sql
-- Table profile_views (statistiques de consultation)
CREATE TABLE profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  recruiter_id UUID REFERENCES recruiters(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45) -- IPv4 ou IPv6, anonymisé après 30j
);

-- Index pour analytics
CREATE INDEX idx_profile_views_player_id ON profile_views(player_id);
CREATE INDEX idx_profile_views_viewed_at ON profile_views(viewed_at);

-- Table watchlist (favoris recruteurs)
CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  UNIQUE(recruiter_id, player_id)
);

-- Index pour récupération rapide watchlist
CREATE INDEX idx_watchlist_recruiter_id ON watchlist(recruiter_id);
```

#### V2 - Tables monétisation

```sql
-- Table payments (transactions)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'FCFA',
  payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('boost', 'credits', 'subscription')),
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('orange_money', 'mtn_money', 'moov_money', 'stripe')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  external_transaction_id VARCHAR(255), -- ID depuis Fedapay/Stripe
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Index pour suivi transactions
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Table boosts (boost de profils joueurs)
CREATE TABLE boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES payments(id),
  duration_days INTEGER NOT NULL CHECK (duration_days IN (7, 30, 90)),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour recherche de profils boostés actifs
CREATE INDEX idx_boosts_active ON boosts(is_active, end_date) WHERE is_active = true;

-- Table credits (crédits recruteurs)
CREATE TABLE credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id), -- Nullable si crédits bonus
  credits_amount INTEGER NOT NULL,
  credits_remaining INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP -- Nullable si pas d'expiration
);

-- Table credit_usage (utilisation crédits)
CREATE TABLE credit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES recruiters(id),
  player_id UUID NOT NULL REFERENCES players(id),
  credits_used INTEGER DEFAULT 1,
  used_at TIMESTAMP DEFAULT NOW()
);

-- Index pour historique usage
CREATE INDEX idx_credit_usage_recruiter_id ON credit_usage(recruiter_id);
```

### Prisma Schema (schema.prisma)

```prisma
// This is your Prisma schema file

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(uuid()) @db.Uuid
  email         String   @unique @db.VarChar(255)
  passwordHash  String   @map("password_hash") @db.VarChar(255)
  userType      UserType @map("user_type")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  // Relations
  player    Player?
  recruiter Recruiter?

  @@map("users")
}

enum UserType {
  player
  recruiter
  admin
}

model Player {
  id                  String   @id @default(uuid()) @db.Uuid
  userId              String   @unique @map("user_id") @db.Uuid
  fullName            String   @map("full_name") @db.VarChar(255)
  birthDate           DateTime @map("birth_date") @db.Date
  nationality         String?  @db.VarChar(100)
  city                String?  @db.VarChar(100)
  country             String   @db.VarChar(100)
  primaryPosition     String   @map("primary_position") @db.VarChar(50)
  secondaryPositions  Json     @default("[]") @map("secondary_positions") @db.JsonB
  strongFoot          Foot?    @map("strong_foot")
  heightCm            Int?     @map("height_cm")
  weightKg            Int?     @map("weight_kg")
  currentClub         String?  @map("current_club") @db.VarChar(255)
  careerHistory       String?  @map("career_history") @db.Text
  phone               String?  @db.VarChar(50)
  profilePhotoUrl     String?  @map("profile_photo_url") @db.VarChar(500)
  videoUrls           Json     @default("[]") @map("video_urls") @db.JsonB
  status              Status   @default(active)
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  // Relations
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  profileViews ProfileView[]
  watchlists   Watchlist[]

  @@index([country])
  @@index([primaryPosition])
  @@index([status])
  @@map("players")
}

enum Foot {
  left
  right
  both
}

enum Status {
  pending
  active
  suspended
}

model Recruiter {
  id               String            @id @default(uuid()) @db.Uuid
  userId           String            @unique @map("user_id") @db.Uuid
  fullName         String            @map("full_name") @db.VarChar(255)
  organizationName String            @map("organization_name") @db.VarChar(255)
  organizationType OrganizationType  @map("organization_type")
  country          String            @db.VarChar(100)
  contactEmail     String?           @map("contact_email") @db.VarChar(255)
  contactPhone     String?           @map("contact_phone") @db.VarChar(50)
  status           RecruiterStatus   @default(pending)
  approvedBy       String?           @map("approved_by") @db.Uuid
  approvedAt       DateTime?         @map("approved_at")
  createdAt        DateTime          @default(now()) @map("created_at")
  updatedAt        DateTime          @updatedAt @map("updated_at")

  // Relations
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  profileViews ProfileView[]
  watchlists   Watchlist[]

  @@index([status])
  @@map("recruiters")
}

enum OrganizationType {
  club
  academy
  agency
  other
}

enum RecruiterStatus {
  pending
  approved
  rejected
  suspended
}

// V1 Tables

model ProfileView {
  id          String    @id @default(uuid()) @db.Uuid
  playerId    String    @map("player_id") @db.Uuid
  recruiterId String?   @map("recruiter_id") @db.Uuid
  viewedAt    DateTime  @default(now()) @map("viewed_at")
  ipAddress   String?   @map("ip_address") @db.VarChar(45)

  // Relations
  player    Player     @relation(fields: [playerId], references: [id], onDelete: Cascade)
  recruiter Recruiter? @relation(fields: [recruiterId], references: [id], onDelete: SetNull)

  @@index([playerId])
  @@index([viewedAt])
  @@map("profile_views")
}

model Watchlist {
  id          String   @id @default(uuid()) @db.Uuid
  recruiterId String   @map("recruiter_id") @db.Uuid
  playerId    String   @map("player_id") @db.Uuid
  addedAt     DateTime @default(now()) @map("added_at")
  notes       String?  @db.Text

  // Relations
  recruiter Recruiter @relation(fields: [recruiterId], references: [id], onDelete: Cascade)
  player    Player    @relation(fields: [playerId], references: [id], onDelete: Cascade)

  @@unique([recruiterId, playerId])
  @@index([recruiterId])
  @@map("watchlist")
}
```

### Requêtes fréquentes optimisées

**Recherche de joueurs (avec filtres) :**
```sql
SELECT p.*, u.email
FROM players p
JOIN users u ON p.user_id = u.id
WHERE p.status = 'active'
  AND p.country = 'Benin'
  AND p.primary_position = 'Attaquant'
  AND EXTRACT(YEAR FROM AGE(p.birth_date)) BETWEEN 18 AND 25
ORDER BY p.created_at DESC
LIMIT 20 OFFSET 0;
```

**Profils boostés (V2) :**
```sql
SELECT p.*, b.end_date
FROM players p
JOIN boosts b ON p.id = b.player_id
WHERE b.is_active = true
  AND b.end_date > NOW()
ORDER BY b.start_date DESC;
```

---

## 🌐 Infrastructure et déploiement

### Environnements

| Environnement | Usage | Hébergement | DB | URL |
|---------------|-------|-------------|----|----|
| **Development** | Développement local | Local (localhost) | PostgreSQL local ou Docker | http://localhost:3000 (frontend) http://localhost:5000 (backend) |
| **Staging** | Tests pré-production | Render (backend) + Vercel (frontend) | Render PostgreSQL (instance séparée) | https://staging.scoutme.app |
| **Production** | Utilisateurs finaux | Render (backend) + Vercel (frontend) | Render PostgreSQL | https://scoutme.app |

### Déploiement Frontend (Vercel)

**Configuration :**
- **Framework Preset :** Next.js
- **Build Command :** `npm run build`
- **Output Directory :** `.next`
- **Install Command :** `npm install`
- **Node Version :** 20.x

**Variables d'environnement :**
```env
NEXT_PUBLIC_API_URL=https://api.scoutme.app
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=scoutme
NEXT_PUBLIC_ENVIRONMENT=production
```

**Déploiement automatique :**
- **Branch main** → Production automatique
- **Pull Requests** → Preview deployments automatiques

### Déploiement Backend (Render)

**Configuration Web Service :**
- **Environment :** Node
- **Build Command :** `npm install && npx prisma generate && npx prisma migrate deploy`
- **Start Command :** `node src/server.js`
- **Health Check Path :** `/health`

**Variables d'environnement :**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/scoutme_prod
JWT_SECRET=<secret_fort_généré>
JWT_REFRESH_SECRET=<autre_secret>
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
RESEND_API_KEY=re_xxx
CORS_ORIGIN=https://scoutme.app
```

**Base de données PostgreSQL (Render) :**
- **Instance :** PostgreSQL 15
- **Backup :** Automatique quotidien (rétention 7 jours tier gratuit, 30 jours payant)
- **Connexion :** SSL/TLS obligatoire

### CI/CD Pipeline

**GitHub Actions (recommandé) :**

```yaml
# .github/workflows/backend.yml
name: Backend CI/CD

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm install
      - name: Run linter
        run: npm run lint
      - name: Run tests
        run: npm test
      - name: Run Prisma validation
        run: npx prisma validate

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Render
        # Render auto-deploy on push to main
```

### Monitoring et observabilité

**Logs :**
- **Frontend :** Vercel Analytics + Logs
- **Backend :** Render Logs (retention 7 jours gratuit)

**Erreurs :** Sentry
- Frontend errors (React Error Boundary)
- Backend errors (Express error handler)
- Alertes email si taux d'erreur > seuil

**Uptime :** UptimeRobot (gratuit)
- Ping toutes les 5 minutes
- Alertes email/SMS si downtime

**Performance :** Google Analytics 4 ou Plausible
- Page views, sessions, conversions
- Respect RGPD (Plausible recommandé)

---

## 🔒 Sécurité

### Authentification

**Hash des mots de passe :**
```javascript
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

// Création
const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

// Vérification
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

**JWT (JSON Web Tokens) :**

**Access Token (courte durée) :**
```javascript
const jwt = require('jsonwebtoken');

const accessToken = jwt.sign(
  {
    userId: user.id,
    userType: user.userType
  },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
);
```

**Refresh Token (longue durée) :**
```javascript
const refreshToken = jwt.sign(
  { userId: user.id },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: '7d' }
);

// Stocké en HTTP-only cookie
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: true, // HTTPS uniquement
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
});
```

**Middleware de vérification :**
```javascript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Autorisation (RBAC - Role-Based Access Control)

**Middleware de contrôle d'accès :**
```javascript
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
};

// Usage
router.get('/admin/dashboard', authMiddleware, requireRole('admin'), adminController.dashboard);
```

**Matrice des permissions :**

| Action | Joueur | Recruteur | Admin |
|--------|--------|-----------|-------|
| Créer profil joueur | ✅ (son profil) | ❌ | ✅ |
| Modifier profil joueur | ✅ (son profil) | ❌ | ✅ |
| Voir profil joueur | ✅ | ✅ | ✅ |
| Rechercher joueurs | ❌ | ✅ | ✅ |
| Valider recruteur | ❌ | ❌ | ✅ |
| Modérer contenu | ❌ | ❌ | ✅ |

### Protection des uploads

**Validation fichiers :**
```javascript
const multer = require('multer');
const path = require('path');

// Configuration Multer
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPG, PNG, WEBP allowed.'));
    }

    cb(null, true);
  }
});
```

### Protection API

**Rate Limiting :**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes max par IP
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Rate limit strict pour auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 tentatives login par 15 min
  skipSuccessfulRequests: true
});

app.use('/api/auth/login', authLimiter);
```

**CORS (Cross-Origin Resource Sharing) :**
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGIN, // https://scoutme.app
  credentials: true, // Autoriser cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Protection CSRF :**
```javascript
const csurf = require('csurf');

const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  }
});

// Appliquer sur routes de modification (POST, PUT, DELETE)
app.use('/api/', csrfProtection);
```

**Helmet (Headers de sécurité) :**
```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "https://api.scoutme.app"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true
  }
}));
```

### Données sensibles

**Chiffrement en transit :**
- HTTPS obligatoire (TLS 1.2+)
- Certificat Let's Encrypt (gratuit, auto-renouvelé)

**Chiffrement au repos :**
- PostgreSQL : encryption at rest (géré par Render)
- Cloudinary : stockage sécurisé

**Conformité RGPD :**
- Hash des mots de passe (bcrypt)
- Anonymisation IP dans logs après 30 jours
- Droit à l'oubli (suppression compte = suppression toutes données)
- Export données personnelles (endpoint `/api/user/export`)

---

## 🔌 Services tiers

### Cloudinary (Stockage photos)

**Configuration :**
```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload
const uploadToCloudinary = async (fileBuffer, folder = 'players') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `scoutme/${folder}`,
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};
```

**Optimisations :**
- Transformation automatique (resize, compression)
- Format moderne (WebP automatique si navigateur supporté)
- Lazy loading (URLs avec paramètres `q_auto`, `f_auto`)

### Resend (Emails)

**Configuration :**
```javascript
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// Email de confirmation inscription
const sendWelcomeEmail = async (userEmail, userName) => {
  await resend.emails.send({
    from: 'ScoutMe <noreply@scoutme.app>',
    to: userEmail,
    subject: 'Bienvenue sur ScoutMe !',
    html: `
      <h1>Bienvenue ${userName} !</h1>
      <p>Votre compte ScoutMe a été créé avec succès.</p>
      <p>Vous pouvez maintenant compléter votre profil et commencer à être visible.</p>
      <a href="https://scoutme.app/dashboard">Accéder à mon profil</a>
    `
  });
};

// Email notification consultation profil
const sendProfileViewedEmail = async (playerEmail, playerName) => {
  await resend.emails.send({
    from: 'ScoutMe <notifications@scoutme.app>',
    to: playerEmail,
    subject: 'Votre profil a été consulté !',
    html: `
      <h2>Bonne nouvelle ${playerName} !</h2>
      <p>Un recruteur vient de consulter votre profil ScoutMe.</p>
      <p>Assurez-vous que votre profil est à jour pour maximiser vos chances.</p>
      <a href="https://scoutme.app/profile/edit">Mettre à jour mon profil</a>
    `
  });
};
```

### Fedapay (Paiements mobile money - V2)

**Configuration :**
```javascript
const FedaPay = require('fedapay');

FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY);
FedaPay.setEnvironment(process.env.FEDAPAY_ENV); // 'sandbox' ou 'live'

// Créer transaction boost
const createBoostPayment = async (playerId, amount, duration) => {
  const transaction = await FedaPay.Transaction.create({
    amount: amount,
    currency: {
      iso: 'XOF' // Franc CFA
    },
    description: `Boost profil ${duration} jours`,
    callback_url: 'https://api.scoutme.app/webhooks/fedapay',
    customer: {
      email: playerEmail,
      firstname: playerName
    }
  });

  return transaction.generateToken();
};
```

**Webhook (confirmation paiement) :**
```javascript
app.post('/webhooks/fedapay', async (req, res) => {
  const event = req.body;

  if (event.entity === 'transaction' && event.status === 'approved') {
    // Activer le boost
    await activateBoost(event.transaction_id);
  }

  res.status(200).send('OK');
});
```

### Stripe (Paiements cartes - V2)

**Configuration :**
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Créer PaymentIntent
const createPaymentIntent = async (amount, metadata) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // En centimes
    currency: 'eur',
    metadata: metadata,
    automatic_payment_methods: {
      enabled: true
    }
  });

  return paymentIntent.client_secret;
};
```

---

## 📁 Structure des projets

### Monorepo (optionnel) ou repos séparés

**Option 1 : Monorepo (recommandé pour petite équipe)**
```
scoutme/
├── frontend/          # Application Next.js
├── backend/           # API Node.js/Express
├── shared/            # Code partagé (types, validations Zod)
├── .github/           # GitHub Actions
└── docker-compose.yml # Dev environment (optionnel)
```

**Option 2 : Repos séparés**
- `scoutme-frontend` (GitHub repo 1)
- `scoutme-backend` (GitHub repo 2)

### Structure détaillée recommandée (Monorepo)

```
scoutme/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── styles/
│   ├── .env.local
│   ├── next.config.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── utils/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.js
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── shared/
│   ├── types/          # Types TypeScript partagés
│   ├── validators/     # Schemas Zod partagés
│   └── constants/      # Constantes (positions, pays, etc.)
│
├── .github/
│   └── workflows/
│       ├── frontend.yml
│       └── backend.yml
│
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   └── API.md
│
├── .gitignore
├── README.md
└── package.json         # Scripts racine (optionnel)
```

---

## ⚙️ Workflow de développement

### Git Workflow

**Branches :**
- `main` → Production
- `staging` → Pré-production
- `develop` → Développement principal
- `feature/*` → Nouvelles fonctionnalités
- `bugfix/*` → Corrections de bugs

**Workflow typique :**
```bash
# Créer feature branch depuis develop
git checkout develop
git pull origin develop
git checkout -b feature/player-profile-edit

# Développer, commiter
git add .
git commit -m "feat: add player profile edit form"

# Pousser et créer PR
git push origin feature/player-profile-edit
# Créer Pull Request sur GitHub (feature/* → develop)

# Après review et merge
git checkout develop
git pull origin develop
git branch -d feature/player-profile-edit
```

### Conventions de commit

**Format :** [Conventional Commits](https://www.conventionalcommits.org/)

```
<type>(<scope>): <description>

[optional body]
```

**Types :**
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage (pas de changement code)
- `refactor`: Refactoring
- `test`: Ajout tests
- `chore`: Maintenance (dépendances, config)

**Exemples :**
```
feat(auth): add JWT refresh token mechanism
fix(player): correct video URL validation
docs(api): update authentication endpoints
refactor(database): optimize player search query
```

### Environnements locaux

**Frontend (Next.js) :**
```bash
cd frontend
npm install
cp .env.example .env.local
# Éditer .env.local avec NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev
# → http://localhost:3000
```

**Backend (Express) :**
```bash
cd backend
npm install
cp .env.example .env
# Éditer .env avec DATABASE_URL et secrets
npx prisma generate
npx prisma migrate dev
npm run dev
# → http://localhost:5000
```

**Base de données locale :**

**Option 1 : PostgreSQL local**
```bash
# Installation (macOS)
brew install postgresql@15
brew services start postgresql@15

# Créer DB
createdb scoutme_dev

# Connection string
DATABASE_URL="postgresql://localhost:5432/scoutme_dev"
```

**Option 2 : Docker**
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: scoutme_dev
      POSTGRES_USER: scoutme
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
docker-compose up -d
# DATABASE_URL="postgresql://scoutme:password@localhost:5432/scoutme_dev"
```

### Tests

**Backend (Jest + Supertest) :**
```bash
npm test                 # Tous les tests
npm test -- --watch      # Mode watch
npm test auth.test.js    # Test spécifique
```

**Frontend (Jest + React Testing Library) :**
```bash
npm test
npm test -- --coverage   # Avec coverage
```

**Tests E2E (Playwright - optionnel V1+) :**
```bash
npx playwright test
npx playwright test --ui  # Mode UI
```

---

## 📈 Considérations de scaling

### MVP → V1 (500+ joueurs)

**Optimisations nécessaires :**
- ✅ Pagination systématique (20 résultats/page)
- ✅ Index DB sur colonnes fréquemment filtrées
- ✅ Lazy loading images (Next.js Image)
- ✅ Cache CDN Cloudflare (assets statiques)

**Infrastructure :** Tier gratuit Render + Vercel suffit

### V1 → V2 (2000+ joueurs)

**Optimisations nécessaires :**
- ✅ Cache Redis (résultats recherches fréquentes)
- ✅ Compression Gzip/Brotli activée
- ✅ Database connection pooling (Prisma automatique)
- ✅ Optimisation requêtes SQL (EXPLAIN ANALYZE)

**Infrastructure :** Upgrade Render vers tier payant (vertical scaling)

### V2+ (10k+ joueurs)

**Optimisations avancées :**
- ✅ Read replicas PostgreSQL (lecture séparée de l'écriture)
- ✅ CDN images (Cloudinary CDN déjà actif)
- ✅ Queue système (Bull/BullMQ) pour tâches asynchrones (emails, analytics)
- ✅ Monitoring APM (Application Performance Monitoring)

**Infrastructure :** Considérer AWS/GCP pour horizontal scaling

### Architecture future (optionnel)

**Microservices (si croissance très forte) :**
```
API Gateway
    ↓
├── Auth Service
├── Players Service
├── Recruiters Service
├── Payments Service
└── Notifications Service
```

**Event-driven (avec message broker) :**
- RabbitMQ ou Kafka pour communication inter-services
- Permet découplage et scalabilité indépendante

---

## 🚀 Prochaines étapes

### Immédiat (avant développement)

1. ✅ **Setup repos Git** (GitHub)
   - Créer organisation ou repos personnels
   - Inviter collaborateurs
   - Configurer branch protection (main, staging)

2. ✅ **Setup services tiers (comptes gratuits)**
   - Cloudinary (signup + noter API keys)
   - Resend (signup + noter API key)
   - Render (signup, préparer PostgreSQL instance)
   - Vercel (connecter GitHub)

3. ✅ **Design/Wireframes** (optionnel mais recommandé)
   - Figma ou Excalidraw
   - Pages clés : Homepage, Login, Player profile, Search

### Sprint 1 - Fondations (Semaine 1-2)

- [ ] Setup projet frontend (Next.js + TailwindCSS + shadcn/ui)
- [ ] Setup projet backend (Express + Prisma)
- [ ] Définir schéma Prisma initial (users, players, recruiters)
- [ ] Migration DB initiale
- [ ] Configuration environnements (.env)
- [ ] Système auth (register, login, JWT)
- [ ] Middleware auth + RBAC basique

### Sprint 2 - Profils (Semaine 3-4)

- [ ] CRUD profil joueur (backend)
- [ ] Formulaire création/édition profil joueur (frontend)
- [ ] Upload photo Cloudinary
- [ ] Embed vidéos YouTube
- [ ] Page profil public joueur
- [ ] CRUD profil recruteur (backend + frontend basique)

### Sprint 3 - Recherche (Semaine 5-6)

- [ ] API recherche joueurs (filtres: position, âge, pays)
- [ ] Interface recherche recruteur (frontend)
- [ ] Affichage résultats (cards, pagination)
- [ ] Page consultation profil complet (recruteur)
- [ ] Révélation contact joueur

### Sprint 4 - Admin & Polish (Semaine 7-8)

- [ ] Dashboard admin (validation recruteurs)
- [ ] Modération profils (masquer/approuver)
- [ ] Responsive design finalisé (mobile)
- [ ] Tests utilisateurs (5-10 personnes)
- [ ] Corrections bugs
- [ ] Déploiement staging
- [ ] **Déploiement production (MVP live !)**

---

**Document vivant - Dernière mise à jour :** 2026-02-01
**Maintenu par :** Équipe ScoutMe
**Questions techniques :** À documenter dans issues GitHub
