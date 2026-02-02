# ScoutMe Frontend

Frontend de la plateforme ScoutMe - Application Next.js 14 avec App Router.

## Stack Technique

- **Framework:** Next.js 14+ (App Router)
- **Langage:** TypeScript
- **Styling:** TailwindCSS
- **Composants UI:** shadcn/ui (à installer)
- **Formulaires:** React Hook Form + Zod
- **HTTP Client:** Axios

## Installation

```bash
npm install
```

## Développement

```bash
# Démarrer le serveur de développement
npm run dev

# Le frontend sera accessible sur http://localhost:3000
```

## Configuration

Copier `.env.example` vers `.env.local` et configurer les variables :

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=scoutme
NEXT_PUBLIC_ENVIRONMENT=development
```

## Structure du Projet

```
frontend/
├── app/              # Next.js App Router
│   ├── auth/        # Pages authentification
│   ├── player/      # Pages joueurs
│   ├── recruiter/   # Pages recruteurs
│   ├── admin/       # Pages admin
│   └── api/         # API routes (optionnel)
├── components/      # Composants React
│   ├── ui/         # Composants shadcn/ui
│   ├── forms/      # Composants formulaires
│   ├── layouts/    # Layouts
│   └── shared/     # Composants partagés
├── lib/            # Utilitaires et helpers
│   ├── api/        # Client API et appels
│   ├── hooks/      # Custom React hooks
│   ├── utils/      # Fonctions utilitaires
│   └── validations/ # Schemas Zod
└── public/         # Assets statiques
```

## Commandes Disponibles

```bash
npm run dev        # Serveur de développement
npm run build      # Build de production
npm run start      # Serveur de production
npm run lint       # Linter ESLint
npm run type-check # Vérification TypeScript
```

## Documentation Complète

Voir [ARCHITECTURE.md](../ARCHITECTURE.md) pour les détails techniques complets.
