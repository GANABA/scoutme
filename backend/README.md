# ScoutMe Backend

Backend API de la plateforme ScoutMe - Node.js/Express + Prisma + PostgreSQL.

## Stack Technique

- **Runtime:** Node.js 20+ LTS
- **Framework:** Express.js v4+
- **Langage:** TypeScript
- **ORM:** Prisma 5+
- **Base de données:** PostgreSQL 15+
- **Authentification:** JWT (access + refresh tokens)

## Prérequis

- Node.js 20+ installé
- PostgreSQL 15+ installé et en cours d'exécution
- npm ou yarn

## Installation

```bash
npm install
```

## Configuration

1. Copier `.env.example` vers `.env`
2. Configurer les variables d'environnement

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/scoutme_dev"
JWT_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CORS_ORIGIN=http://localhost:3000
```

3. Générer le client Prisma

```bash
npm run prisma:generate
```

4. Créer la base de données et appliquer les migrations

```bash
npm run prisma:migrate
```

## Développement

```bash
# Démarrer le serveur de développement (avec hot-reload)
npm run dev

# Le backend sera accessible sur http://localhost:5000
```

## Base de Données (Prisma)

```bash
# Générer le client Prisma (après modification du schema)
npm run prisma:generate

# Créer une nouvelle migration
npm run prisma:migrate

# Ouvrir Prisma Studio (GUI base de données)
npm run prisma:studio

# Seeder la base de données (données de test)
npm run prisma:seed
```

## Structure du Projet

```
backend/
├── src/
│   ├── config/          # Configuration (DB, env)
│   ├── routes/          # Définition des routes API
│   ├── controllers/     # Logique de traitement des requêtes
│   ├── services/        # Logique métier (business logic)
│   ├── middlewares/     # Middlewares Express
│   │   ├── auth.middleware.ts    # Vérification JWT
│   │   ├── rbac.middleware.ts    # Contrôle d'accès (rôles)
│   │   └── validate.middleware.ts # Validation Zod
│   ├── validators/      # Schemas de validation Zod
│   ├── utils/           # Fonctions utilitaires
│   ├── prisma/
│   │   ├── schema.prisma # Schéma de base de données
│   │   ├── migrations/   # Migrations générées
│   │   └── seed.ts       # Données de test
│   ├── app.ts           # Configuration Express
│   └── server.ts        # Point d'entrée
└── tests/               # Tests unitaires et intégration
```

## Commandes Disponibles

```bash
npm run dev          # Serveur de développement (hot-reload avec tsx)
npm run build        # Build TypeScript → JavaScript (dist/)
npm run start        # Serveur de production (nécessite build)
npm run lint         # Linter ESLint
npm run type-check   # Vérification TypeScript
npm test             # Tests (Jest)
```

## API Endpoints (MVP)

### Authentification
- `POST /api/auth/register` - Inscription joueur/recruteur
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/refresh` - Rafraîchir le token

### Joueurs
- `GET /api/players` - Liste des joueurs (avec filtres)
- `GET /api/players/:id` - Détails d'un joueur
- `POST /api/players` - Créer un profil joueur
- `PUT /api/players/:id` - Modifier son profil
- `DELETE /api/players/:id` - Supprimer son profil

### Recruteurs
- `GET /api/recruiters/me` - Mon profil recruteur
- `PUT /api/recruiters/me` - Modifier mon profil

### Admin
- `GET /api/admin/recruiters/pending` - Recruteurs en attente
- `POST /api/admin/recruiters/:id/approve` - Approuver un recruteur
- `POST /api/admin/recruiters/:id/reject` - Rejeter un recruteur

## Documentation Complète

Voir [ARCHITECTURE.md](../ARCHITECTURE.md) pour les détails techniques complets.
