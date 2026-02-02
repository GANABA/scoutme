# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**ScoutMe** is a football player scouting platform connecting players with recruiters in West Africa. The platform allows players to create professional profiles (videos, stats, photos) and enables recruiters to search, filter, and contact talents efficiently.

**Current Status:** Planning phase - PRD and technical architecture documented, no code yet.

**Target Market:** Benin and West Africa (expanding to all of Africa)
**Business Model:** Freemium (pay-per-boost for players, credit-based for recruiters)

---

## Documentation Structure

### Core Documents

1. **PRD.md** - Product Requirements Document
   - Product vision, user personas, business model
   - Features by phase (MVP, V1, V2)
   - Non-functional requirements (performance, UX, legal)
   - Success criteria and KPIs

2. **ARCHITECTURE.md** - Technical Architecture
   - Complete technical stack and justifications
   - Database schema (Prisma + PostgreSQL)
   - Infrastructure and deployment (Vercel + Render)
   - Security implementation details
   - Development workflow and sprint plan

**Rule:** When making product decisions, consult PRD.md. For technical implementation, consult ARCHITECTURE.md.

---

## Technical Architecture

### Stack (Defined in ARCHITECTURE.md)

**Frontend:**
- Next.js 14+ (App Router) + React 18+
- TailwindCSS + shadcn/ui components
- TypeScript (strongly recommended)
- React Hook Form + Zod validation

**Backend:**
- Node.js 20+ LTS + Express.js v4+
- Prisma ORM (type-safe database access)
- PostgreSQL 15+
- JWT authentication (access + refresh tokens)

**Infrastructure:**
- Frontend: Vercel
- Backend + DB: Render
- Photos: Cloudinary
- Videos: YouTube embed (MVP), Cloudinary (V2+)
- Email: Resend
- Payments: Fedapay (mobile money) + Stripe (cards) [V2]

### Project Structure (When Code Exists)

```
scoutme/
├── frontend/          # Next.js application
│   ├── app/          # Next.js 14 App Router
│   ├── components/   # React components
│   ├── lib/          # Utilities, API calls, hooks
│   └── styles/       # Global CSS, Tailwind config
│
├── backend/          # Express.js API
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── middlewares/  # Auth, validation, RBAC
│   │   ├── validators/   # Zod schemas
│   │   └── prisma/       # Database schema & migrations
│   └── tests/
│
├── shared/           # Shared types & validators
├── docs/             # Documentation (PRD, ARCHITECTURE)
└── .github/          # CI/CD workflows
```

### Database Architecture

**Core entities:** Users, Players, Recruiters

**User types:** `player`, `recruiter`, `admin`

**Key relationships:**
- User 1:1 Player (if user_type = 'player')
- User 1:1 Recruiter (if user_type = 'recruiter')
- Player 1:N ProfileViews (V1)
- Recruiter 1:N Watchlist (V1)
- Player 1:N Boosts (V2, paid feature)

**Full schema:** See `backend/src/prisma/schema.prisma` (once created) or ARCHITECTURE.md sections 4.

---

## Development Phases

### MVP (Current Target - 8 weeks)

**Scope:** Free platform, core features only

**Key features:**
- Player registration + profile (name, position, age, city, 3 YouTube videos, 1 photo)
- Recruiter registration + manual admin validation
- Player search (filters: position, age, country)
- Direct contact reveal (phone/email)
- Admin dashboard (validate recruiters, moderate players)

**Constraints:**
- French only
- Mobile-first responsive
- No payments, no messaging, no notifications

**Excluded from MVP:**
- Multi-language (V1)
- Advanced stats (V1)
- Watchlist/favorites (V1)
- Monetization (V2)
- Opportunities board (V2)

### V1 (Post-MVP)
- English translation
- Player stats, photo gallery (5 photos)
- Recruiter watchlist, advanced filters
- Email notifications
- Payment system integration (inactive)

### V2 (Monetization)
- Activate freemium model (boosts + credits)
- Internal messaging
- Clubs/academies directory
- Opportunities board

---

## Key Technical Decisions

### Authentication Flow
- JWT-based (access token 15min, refresh token 7 days)
- Refresh token stored in HTTP-only cookie
- Access token sent in Authorization header
- Password hashing: bcrypt (10 rounds minimum)

### Authorization (RBAC)
- **Players:** Can only edit their own profile
- **Recruiters:** Read-only access to player profiles, edit own profile
- **Admins:** Full access to moderation, user validation

### API Design
- RESTful architecture (MVP)
- Endpoints follow `/api/<resource>/<action>` pattern
- Validation via Zod schemas (shared between frontend/backend)
- Error responses: `{ error: "message", code: "ERROR_CODE" }`

### File Uploads
- Photos: Cloudinary (5MB max, JPG/PNG/WebP only)
- Videos: YouTube embeds (MVP), direct upload (V2)
- Validation: MIME type + file size checks

### Security Requirements
- HTTPS mandatory (Let's Encrypt)
- Rate limiting (100 req/min general, 5 req/15min for auth)
- CORS: strict origin whitelist
- CSRF protection on state-changing operations
- Input validation server-side (never trust client)

---

## Development Workflow

### Git Strategy
- **main**: Production
- **staging**: Pre-production
- **develop**: Development integration
- **feature/\***: New features
- **bugfix/\***: Bug fixes

### Commit Convention
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
<type>(<scope>): <description>

feat(auth): add JWT refresh token mechanism
fix(player): correct video URL validation
docs(api): update authentication endpoints
refactor(database): optimize player search query
```

### Branch Protection
- **main** and **staging** require pull request reviews
- CI must pass before merge

---

## Commands (Once Code Exists)

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev          # Development server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm test             # Run tests
```

### Backend (Express)
```bash
cd backend
npm install
npm run dev          # Development server (http://localhost:5000)
npm run build        # TypeScript compilation (if using TS)
npm test             # Run tests
npm run lint         # ESLint

# Prisma commands
npx prisma generate              # Generate Prisma Client
npx prisma migrate dev           # Create and apply migration (dev)
npx prisma migrate deploy        # Apply migrations (production)
npx prisma studio                # Open Prisma Studio (DB GUI)
npx prisma db seed               # Seed database
```

### Database Management
```bash
# Reset database (dev only - DESTRUCTIVE)
npx prisma migrate reset

# View current schema
npx prisma db pull

# Validate schema
npx prisma validate
```

---

## Important Constraints

### Mobile-First Mandatory
60%+ of traffic expected from mobile devices in Africa. Every feature MUST be:
- Tested on mobile viewport first
- Touch-friendly (min 44x44px tap targets)
- Performant on 3G connections

### Localization (i18n)
- MVP: French hardcoded
- V1+: Use i18n structure from day 1 (even if single language)
  - Store strings in `/lib/i18n/fr.json` (frontend)
  - Never hardcode user-facing strings in components

### Payment Context
- Mobile money is primary payment method in Africa (Orange Money, MTN, Moov)
- Stripe is secondary (few credit cards)
- Integration via Fedapay/CinetPay (aggregators)

### Data Privacy (RGPD-Compliant)
- Player profile data: consent-based
- Recruiter access: legitimate interest
- Right to deletion (full cascade)
- Export user data on request
- Minors (<18): require parental consent mention

---

## Business Logic Rules

### Player Profiles
- Max 3 YouTube videos (MVP), 10 videos (premium V2)
- Max 1 photo (MVP), 5 photos (V1), 10 photos (premium V2)
- Mandatory fields: name, birth_date, country, primary_position, phone
- Age calculated from birth_date (not stored separately)

### Recruiter Validation
- Manual approval required (default status: 'pending')
- Admin must verify organization legitimacy (phone call recommended)
- Once approved, status = 'approved', can search players
- Can be suspended (status = 'suspended') if abuse detected

### Search Visibility
- Only 'active' player profiles shown in search
- Suspended/pending profiles hidden
- Boosted profiles (V2) appear first in results

### Contact Reveal
- MVP: Free (phone/email displayed directly)
- V2: Requires 1 credit per player contact reveal
- Once revealed, contact cached (recruiter doesn't pay again for same player)

---

## Performance Targets

**Page Load Times:**
- Homepage: < 2s
- Player search: < 3s
- Player profile: < 2s (excluding YouTube embed load)

**Optimization Strategies:**
- Lazy load images (next/image)
- Pagination: 20 results per page
- Database indexes on: country, primary_position, status
- CDN for static assets (Cloudflare)
- Redis cache (V2+) for frequent searches

---

## Testing Strategy

### Unit Tests
- Services layer (business logic)
- Utility functions
- Validation schemas (Zod)

### Integration Tests
- API endpoints (Supertest)
- Database operations (Prisma)
- Authentication flows

### E2E Tests (V1+)
- Playwright for critical user journeys:
  - Player registration → profile creation → search visibility
  - Recruiter registration → validation → search → contact

---

## Deployment

### Environments
- **Development:** Local (localhost)
- **Staging:** Render (backend) + Vercel (frontend)
- **Production:** Render (backend) + Vercel (frontend)

### CI/CD
- GitHub Actions on push to `main` and `staging`
- Steps: lint → test → build → deploy
- Automatic preview deployments for pull requests (Vercel)

### Environment Variables
**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=scoutme
NEXT_PUBLIC_ENVIRONMENT=development
```

**Backend (.env):**
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/scoutme_dev
JWT_SECRET=<generated_secret>
JWT_REFRESH_SECRET=<generated_secret>
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
RESEND_API_KEY=re_xxx
CORS_ORIGIN=http://localhost:3000
```

---

## Common Pitfalls to Avoid

1. **Hardcoded strings in UI:** Always use i18n structure (even if single language initially)
2. **Client-side only validation:** ALWAYS validate server-side with Zod
3. **Exposing sensitive data:** Never send password_hash, JWT secrets, or full user objects to frontend
4. **Missing indexes:** Search queries on players table require indexes (see schema)
5. **Not handling edge cases:**
   - Player with no videos (allow profile, show placeholder)
   - Recruiter searching with no results (show helpful message)
   - Network errors (display user-friendly retry option)

---

## Sprint Plan (MVP Development)

**Sprint 1 (Weeks 1-2):** Authentication + Profiles
- User registration/login (JWT)
- Player profile CRUD
- Recruiter profile CRUD
- Admin validation dashboard

**Sprint 2 (Weeks 3-4):** Search + Display
- Player search API (filters)
- Search results UI
- Player profile public view
- Photo upload (Cloudinary)

**Sprint 3 (Weeks 5-6):** Polish + Integration
- YouTube embed
- Mobile responsive testing
- Contact reveal flow
- Error handling

**Sprint 4 (Week 7-8):** Testing + Launch
- User testing (5-10 people)
- Bug fixes
- Production deployment
- Soft launch

**Detailed sprint breakdown:** See ARCHITECTURE.md section 11.

---

## Future Considerations (V2+)

### Scalability
- Read replicas for PostgreSQL (if >10k users)
- Redis caching layer (search results, user sessions)
- Queue system for async tasks (emails, analytics)
- CDN for uploaded videos (if moving away from YouTube)

### Features on Roadmap (Not MVP)
- AI video analysis (detect highlights, skills)
- Native mobile apps (iOS/Android)
- Contract management system
- Multi-sport support
- API for third-party integrations

---

## Questions/Clarifications

When working on this codebase and you need clarification:

1. **Product questions:** Check PRD.md first
2. **Technical implementation:** Check ARCHITECTURE.md first
3. **Database schema:** See ARCHITECTURE.md section 4 or `prisma/schema.prisma`
4. **API design:** Follow REST conventions, reference ARCHITECTURE.md section 3

If documentation doesn't cover it, ask the user before making assumptions.

---

## Documentation

### Reference Documents
- **[PRD.md](./PRD.md)** - Product Requirements Document (vision produit, fonctionnalités, business model, KPIs)
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture technique complète (stack, infrastructure, base de données, sécurité, déploiement)

**Rule:** Always consult these documents before making product or technical decisions.

---

## Contraintes et Politiques

### Sécurité API
**CRITIQUE:** NE JAMAIS exposer les clés API au client
- Toutes les clés API doivent rester côté serveur (backend uniquement)
- Variables d'environnement préfixées `NEXT_PUBLIC_*` sont exposées au client → ne JAMAIS y mettre de secrets
- Exemples interdits côté client : `CLOUDINARY_API_SECRET`, `RESEND_API_KEY`, `JWT_SECRET`, `STRIPE_SECRET_KEY`
- Exemples autorisés côté client : `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (noms publics uniquement)

### Gestion des Dépendances
**Principe:** Préférer les composants existants plutôt que d'ajouter de nouvelles bibliothèques UI

**Approche recommandée:**
1. Utiliser d'abord shadcn/ui (déjà dans la stack)
2. Si composant manquant, vérifier si Tailwind CSS suffit
3. Seulement si vraiment nécessaire, proposer une nouvelle bibliothèque avec justification

**Exemples:**
- ✅ shadcn/ui Button, Input, Dialog, etc.
- ✅ Tailwind CSS pour layouts et styling personnalisé
- ❌ Ajouter Material-UI, Ant Design, Chakra UI (redondant avec shadcn/ui)

---

## Workflow de Développement UI

### Tests d'Interface Obligatoires
**À la fin de chaque développement qui implique l'interface graphique:**

Utiliser **playwright-skill** pour tester :
- ✅ **Responsive design** - Tester mobile (375px), tablette (768px), desktop (1920px)
- ✅ **Fonctionnalité** - Tous les boutons, formulaires, liens fonctionnent
- ✅ **Conformité au besoin** - L'interface répond exactement au besoin développé

**Commandes Playwright (une fois code existant):**
```bash
# Tester une page spécifique
npx playwright test pages/player-profile.spec.ts

# Mode UI (interactif)
npx playwright test --ui

# Tester sur mobile uniquement
npx playwright test --project=mobile
```

### Design Frontend Moderne
**Toujours utiliser la skill "frontend-design"** (anthropic/claude-plugins-official)

**Objectif:** Créer des interfaces :
- Modernes et fluides
- Simples et intuitives
- Qui ne soient pas automatiquement reconnues comme générées par un agent IA

**Appliquer les principes:**
- Éviter les designs génériques (gradients arc-en-ciel, cards trop arrondies)
- Utiliser des espaces blancs intentionnels
- Typographie cohérente (hiérarchie claire)
- Micro-interactions subtiles (hover, transitions)
- Couleurs de marque cohérentes (définir palette ScoutMe)

**Invoquer la skill:**
```
Utiliser frontend-design pour créer [composant/page]
```

---

## Utilisation de Context7

### Règle d'Usage Automatique
**Toujours utiliser Context7** lorsque besoin de :
1. Génération de code avec bibliothèque spécifique
2. Étapes de configuration ou d'installation
3. Documentation de bibliothèque/API

**Important:** Utiliser automatiquement les outils MCP Context7 pour résoudre l'identifiant de bibliothèque et obtenir la documentation, **sans attendre que l'utilisateur le demande explicitement**.

**Exemples d'usage:**
- Configuration Prisma → Context7 pour doc Prisma
- Setup Stripe/Fedapay → Context7 pour doc API paiement
- Composants shadcn/ui → Context7 pour doc shadcn
- Configuration Next.js App Router → Context7 pour doc Next.js

**Workflow:**
```
1. Identifier bibliothèque nécessaire
2. Utiliser Context7 pour obtenir doc
3. Générer code basé sur doc officielle
4. Appliquer au projet
```

---

## Spécifications et Documentation

### Langue des Spécifications
**Règle:** Toutes les spécifications doivent être rédigées en **français**, y compris les specs OpenSpec.

**Exception:** Seuls les titres de **Requirements** doivent rester en **anglais** avec les mots-clés `SHALL`/`MUST` pour la validation OpenSpec.

**Exemple de structure:**
```markdown
# Spécification: Authentification Joueur

## Description
Le système doit permettre aux joueurs de s'inscrire et se connecter de manière sécurisée.

## Requirements

### REQ-AUTH-001: User Registration
The system SHALL validate email format before creating account.

### REQ-AUTH-002: Password Security
The system MUST hash passwords using bcrypt with minimum 10 rounds.

## Détails d'implémentation
[Texte en français...]
```

**Appliquer à:**
- Spécifications fonctionnelles
- User stories
- Documentation technique
- Commentaires de code (français privilégié, anglais acceptable)
- Messages d'erreur utilisateur (français obligatoire)

---

**Last Updated:** 2026-02-02
**Maintainer:** ScoutMe Team
