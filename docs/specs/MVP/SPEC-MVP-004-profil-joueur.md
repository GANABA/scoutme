# SPEC-MVP-004: Création Profil Joueur

**Phase:** MVP
**Sprint:** 1
**Domaine:** Player Management
**Priorité:** Critique
**Dépendances:** SPEC-MVP-001, SPEC-MVP-002

---

## Description

Système complet de gestion du profil joueur (CRUD). Permet aux joueurs de créer, afficher, modifier et gérer leur profil professionnel incluant informations personnelles, position, caractéristiques physiques, club actuel et historique de carrière.

---

## Requirements

### REQ-PLAYER-001: Profile Creation
The system SHALL create player profile after successful user registration with type 'player'.

### REQ-PLAYER-002: Mandatory Fields Validation
The system MUST validate mandatory fields: fullName, birthDate, country, primaryPosition, phone.

### REQ-PLAYER-003: Age Calculation
The system SHALL calculate player age from birthDate (minimum 13 years, maximum 45 years).

### REQ-PLAYER-004: Position Validation
The system MUST validate positions against predefined list of valid football positions.

### REQ-PLAYER-005: Profile Uniqueness
The system SHALL ensure one player profile per user (1:1 relationship with User).

### REQ-PLAYER-006: Profile Status Management
The system SHALL manage player status (pending, active, suspended).

### REQ-PLAYER-007: Authorization Control
The system MUST restrict profile editing to profile owner only (RBAC).

---

## Endpoints API

### POST /api/players
**Description:** Créer un profil joueur (lié à l'utilisateur authentifié)

**Authentication:** Requiert JWT access token + userType = 'player'

**Request Body:**
```json
{
  "fullName": "string (required, max 255)",
  "birthDate": "string ISO 8601 (required, YYYY-MM-DD)",
  "nationality": "string (optional, max 100)",
  "city": "string (optional, max 100)",
  "country": "string (required, max 100)",
  "primaryPosition": "string (required, max 50)",
  "secondaryPositions": ["string"] (optional, array max 3),
  "strongFoot": "left|right|both (optional)",
  "heightCm": "number (optional, 140-220)",
  "weightKg": "number (optional, 40-150)",
  "currentClub": "string (optional, max 255)",
  "careerHistory": "string (optional, text)",
  "phone": "string (required, max 50)"
}
```

**Response 201 Created:**
```json
{
  "message": "Profil joueur créé avec succès",
  "player": {
    "id": "uuid",
    "userId": "uuid",
    "fullName": "John Doe",
    "birthDate": "2000-05-15",
    "age": 25,
    "nationality": "Beninese",
    "city": "Cotonou",
    "country": "Benin",
    "primaryPosition": "Midfielder",
    "secondaryPositions": ["Winger"],
    "strongFoot": "right",
    "heightCm": 178,
    "weightKg": 75,
    "currentClub": "AS Dragons",
    "careerHistory": "Started at youth academy...",
    "phone": "+229 12345678",
    "profilePhotoUrl": null,
    "videoUrls": [],
    "status": "active",
    "createdAt": "2026-02-02T10:00:00Z",
    "updatedAt": "2026-02-02T10:00:00Z"
  }
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Données invalides",
  "code": "PLAYER_INVALID_DATA",
  "details": [
    {
      "field": "birthDate",
      "message": "Le joueur doit avoir entre 13 et 45 ans"
    }
  ]
}
```

**Response 409 Conflict:**
```json
{
  "error": "Un profil joueur existe déjà pour cet utilisateur",
  "code": "PLAYER_PROFILE_EXISTS"
}
```

---

### GET /api/players/:id
**Description:** Récupérer un profil joueur par ID (public)

**Authentication:** Optionnelle (profil public)

**Response 200 OK:**
```json
{
  "player": {
    "id": "uuid",
    "fullName": "John Doe",
    "birthDate": "2000-05-15",
    "age": 25,
    "nationality": "Beninese",
    "city": "Cotonou",
    "country": "Benin",
    "primaryPosition": "Midfielder",
    "secondaryPositions": ["Winger"],
    "strongFoot": "right",
    "heightCm": 178,
    "weightKg": 75,
    "currentClub": "AS Dragons",
    "careerHistory": "Started at youth academy...",
    "phone": "+229 12345678",
    "profilePhotoUrl": "https://res.cloudinary.com/scoutme/...",
    "videoUrls": [
      {
        "url": "https://youtube.com/watch?v=xxx",
        "title": "Highlights 2025"
      }
    ],
    "status": "active",
    "createdAt": "2026-02-02T10:00:00Z",
    "updatedAt": "2026-02-02T10:00:00Z"
  }
}
```

**Response 404 Not Found:**
```json
{
  "error": "Profil joueur introuvable",
  "code": "PLAYER_NOT_FOUND"
}
```

---

### GET /api/players/me
**Description:** Récupérer le profil du joueur authentifié

**Authentication:** Requiert JWT access token + userType = 'player'

**Response 200 OK:**
```json
{
  "player": {
    "id": "uuid",
    "userId": "uuid",
    "fullName": "John Doe",
    ...
  }
}
```

**Response 404 Not Found:**
```json
{
  "error": "Aucun profil joueur associé à cet utilisateur",
  "code": "PLAYER_PROFILE_NOT_FOUND"
}
```

---

### PUT /api/players/:id
**Description:** Mettre à jour un profil joueur

**Authentication:** Requiert JWT access token + ownership (only owner can edit)

**Request Body:** (Tous les champs optionnels sauf ceux modifiés)
```json
{
  "fullName": "string (optional)",
  "birthDate": "string ISO 8601 (optional)",
  "nationality": "string (optional)",
  "city": "string (optional)",
  "country": "string (optional)",
  "primaryPosition": "string (optional)",
  "secondaryPositions": ["string"] (optional),
  "strongFoot": "left|right|both (optional)",
  "heightCm": "number (optional)",
  "weightKg": "number (optional)",
  "currentClub": "string (optional)",
  "careerHistory": "string (optional)",
  "phone": "string (optional)"
}
```

**Response 200 OK:**
```json
{
  "message": "Profil joueur mis à jour avec succès",
  "player": {
    "id": "uuid",
    "userId": "uuid",
    "fullName": "John Doe Updated",
    ...
  }
}
```

**Response 403 Forbidden:**
```json
{
  "error": "Vous ne pouvez modifier que votre propre profil",
  "code": "AUTH_FORBIDDEN_OWNERSHIP"
}
```

---

### DELETE /api/players/:id
**Description:** Supprimer un profil joueur (soft delete: status = 'suspended')

**Authentication:** Requiert JWT access token + ownership OR admin

**Response 200 OK:**
```json
{
  "message": "Profil joueur supprimé avec succès"
}
```

**Note:** MVP implémente soft delete (status = 'suspended'). Hard delete (cascade User) possible pour admins uniquement.

---

## Schéma Base de Données

### Modèle Player (déjà existant dans Prisma schema)

```prisma
enum Foot {
  left
  right
  both
}

enum PlayerStatus {
  pending
  active
  suspended
}

model Player {
  id                 String        @id @default(uuid()) @db.Uuid
  userId             String        @unique @map("user_id") @db.Uuid
  fullName           String        @map("full_name") @db.VarChar(255)
  birthDate          DateTime      @map("birth_date") @db.Date
  nationality        String?       @db.VarChar(100)
  city               String?       @db.VarChar(100)
  country            String        @db.VarChar(100)
  primaryPosition    String        @map("primary_position") @db.VarChar(50)
  secondaryPositions Json          @default("[]") @map("secondary_positions") @db.JsonB
  strongFoot         Foot?         @map("strong_foot")
  heightCm           Int?          @map("height_cm")
  weightKg           Int?          @map("weight_kg")
  currentClub        String?       @map("current_club") @db.VarChar(255)
  careerHistory      String?       @map("career_history") @db.Text
  phone              String?       @db.VarChar(50)
  profilePhotoUrl    String?       @map("profile_photo_url") @db.VarChar(500)
  videoUrls          Json          @default("[]") @map("video_urls") @db.JsonB
  status             PlayerStatus  @default(active)
  createdAt          DateTime      @default(now()) @map("created_at")
  updatedAt          DateTime      @updatedAt @map("updated_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([country])
  @@index([primaryPosition])
  @@index([status])
  @@map("players")
}
```

**Migration à créer:**
```bash
npx prisma migrate dev --name create_player_table
```

---

## Positions de Football Valides

### Positions Primaires Acceptées

```typescript
export const VALID_POSITIONS = [
  // Défenseurs
  'Goalkeeper',
  'Center Back',
  'Left Back',
  'Right Back',
  'Wing Back',

  // Milieux
  'Defensive Midfielder',
  'Central Midfielder',
  'Attacking Midfielder',
  'Left Midfielder',
  'Right Midfielder',
  'Winger',

  // Attaquants
  'Striker',
  'Forward',
  'Second Striker'
] as const;

export type Position = typeof VALID_POSITIONS[number];
```

---

## Validation des Données

### Schéma Zod: Create Player Profile

```typescript
import { z } from 'zod';

const VALID_POSITIONS = [
  'Goalkeeper',
  'Center Back',
  'Left Back',
  'Right Back',
  'Wing Back',
  'Defensive Midfielder',
  'Central Midfielder',
  'Attacking Midfielder',
  'Left Midfielder',
  'Right Midfielder',
  'Winger',
  'Striker',
  'Forward',
  'Second Striker'
];

export const createPlayerSchema = z.object({
  fullName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(255, 'Le nom ne peut pas dépasser 255 caractères')
    .trim(),

  birthDate: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 13 && age <= 45;
    }, 'Le joueur doit avoir entre 13 et 45 ans'),

  nationality: z.string()
    .max(100, 'La nationalité ne peut pas dépasser 100 caractères')
    .trim()
    .optional(),

  city: z.string()
    .max(100, 'La ville ne peut pas dépasser 100 caractères')
    .trim()
    .optional(),

  country: z.string()
    .min(2, 'Le pays est requis')
    .max(100, 'Le pays ne peut pas dépasser 100 caractères')
    .trim(),

  primaryPosition: z.enum(VALID_POSITIONS as [string, ...string[]], {
    errorMap: () => ({ message: 'Position invalide' })
  }),

  secondaryPositions: z.array(
    z.enum(VALID_POSITIONS as [string, ...string[]])
  )
    .max(3, 'Maximum 3 positions secondaires')
    .optional()
    .default([]),

  strongFoot: z.enum(['left', 'right', 'both'])
    .optional(),

  heightCm: z.number()
    .int('La taille doit être un nombre entier')
    .min(140, 'Taille minimum: 140 cm')
    .max(220, 'Taille maximum: 220 cm')
    .optional(),

  weightKg: z.number()
    .int('Le poids doit être un nombre entier')
    .min(40, 'Poids minimum: 40 kg')
    .max(150, 'Poids maximum: 150 kg')
    .optional(),

  currentClub: z.string()
    .max(255, 'Le nom du club ne peut pas dépasser 255 caractères')
    .trim()
    .optional(),

  careerHistory: z.string()
    .max(5000, 'L\'historique ne peut pas dépasser 5000 caractères')
    .trim()
    .optional(),

  phone: z.string()
    .min(8, 'Numéro de téléphone invalide')
    .max(50, 'Numéro de téléphone trop long')
    .trim()
});

export const updatePlayerSchema = createPlayerSchema.partial();
```

---

## Logique Métier

### Calcul de l'Âge

```typescript
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  const birth = new Date(birthDate);

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export function validateAge(birthDate: Date): boolean {
  const age = calculateAge(birthDate);
  return age >= 13 && age <= 45;
}
```

### Formatage des Réponses

```typescript
export function formatPlayerResponse(player: Player) {
  return {
    id: player.id,
    userId: player.userId,
    fullName: player.fullName,
    birthDate: player.birthDate.toISOString().split('T')[0], // YYYY-MM-DD
    age: calculateAge(player.birthDate),
    nationality: player.nationality,
    city: player.city,
    country: player.country,
    primaryPosition: player.primaryPosition,
    secondaryPositions: player.secondaryPositions as string[],
    strongFoot: player.strongFoot,
    heightCm: player.heightCm,
    weightKg: player.weightKg,
    currentClub: player.currentClub,
    careerHistory: player.careerHistory,
    phone: player.phone,
    profilePhotoUrl: player.profilePhotoUrl,
    videoUrls: player.videoUrls as Array<{ url: string; title?: string }>,
    status: player.status,
    createdAt: player.createdAt.toISOString(),
    updatedAt: player.updatedAt.toISOString()
  };
}
```

---

## Structure du Code

### Fichiers à créer

```
backend/src/
├── services/
│   └── player.service.ts           # Logique métier profils joueurs
├── controllers/
│   └── player.controller.ts        # Handlers requêtes HTTP
├── routes/
│   └── player.routes.ts            # Routes API joueurs
├── validators/
│   └── player.validator.ts         # Schémas Zod validation
└── utils/
    └── player.utils.ts             # Helpers (calcul âge, formatage)
```

---

## Sécurité

### Contrôle d'Accès (RBAC)

**Créer profil:**
- Utilisateur authentifié
- `userType` = 'player'
- Pas de profil existant

**Lire profil (public):**
- N'importe qui (y compris non-authentifié)
- Seuls profils `status = 'active'` visibles en recherche (SPEC-MVP-009)

**Modifier profil:**
- Utilisateur authentifié
- Propriétaire du profil uniquement (`userId` = `player.userId`)

**Supprimer profil:**
- Propriétaire (soft delete: `status = 'suspended'`)
- Admin (hard delete possible)

### Validation des Entrées

- Validation Zod côté serveur (obligatoire)
- Sanitization des chaînes de caractères (trim)
- Validation âge serveur (13-45 ans)
- Validation positions contre liste blanche

---

## Tests à Implémenter

### Tests Unitaires

**player.service.spec.ts:**
- ✅ Create player profile with valid data
- ✅ Create player profile with existing userId (should fail)
- ✅ Create player profile with age < 13 (should fail)
- ✅ Create player profile with age > 45 (should fail)
- ✅ Create player profile with invalid position (should fail)
- ✅ Get player by ID (existing)
- ✅ Get player by ID (non-existing)
- ✅ Update player profile with valid data
- ✅ Delete player profile (soft delete)

### Tests d'Intégration

**player.routes.spec.ts:**
- ✅ POST /api/players - Authenticated player user
- ✅ POST /api/players - Unauthenticated (should fail 401)
- ✅ POST /api/players - Recruiter user (should fail 403)
- ✅ POST /api/players - Duplicate profile (should fail 409)
- ✅ GET /api/players/:id - Public access
- ✅ GET /api/players/me - Authenticated player
- ✅ PUT /api/players/:id - Owner only
- ✅ PUT /api/players/:id - Non-owner (should fail 403)
- ✅ DELETE /api/players/:id - Owner only

---

## Workflow Utilisateur

### Flux Création de Profil

1. **Utilisateur s'inscrit** avec `userType = 'player'` (SPEC-MVP-001)
2. **Utilisateur valide email** (SPEC-MVP-002)
3. **Frontend redirige** vers formulaire création profil
4. **Utilisateur remplit** formulaire (nom, date naissance, position, etc.)
5. **Frontend envoie** POST /api/players avec JWT access token
6. **Backend crée** profil joueur lié à userId
7. **Frontend redirige** vers dashboard joueur

### Flux Modification de Profil

1. **Joueur accède** à "Mon profil" dans dashboard
2. **Frontend charge** GET /api/players/me
3. **Joueur modifie** les champs désirés
4. **Frontend envoie** PUT /api/players/:id
5. **Backend valide** ownership et met à jour
6. **Frontend affiche** message de succès

---

## Critères d'Acceptation

- [ ] Un joueur peut créer son profil après inscription
- [ ] Un utilisateur ne peut avoir qu'un seul profil joueur
- [ ] Les champs obligatoires sont validés (nom, date naissance, pays, position, téléphone)
- [ ] L'âge doit être entre 13 et 45 ans
- [ ] Les positions sont validées contre liste prédéfinie
- [ ] Un joueur peut voir son propre profil complet
- [ ] Un joueur peut modifier uniquement son propre profil
- [ ] Les profils publics sont accessibles sans authentification
- [ ] Tous les tests unitaires et d'intégration passent

---

## Notes d'Implémentation

### Frontend (Next.js)

**Pages à créer:**
- `/players/create` - Formulaire création profil
- `/players/[id]` - Vue publique profil joueur
- `/dashboard/player` - Dashboard joueur (voir SPEC-MVP-012)
- `/dashboard/player/profile` - Formulaire édition profil

**Composants:**
```typescript
// app/players/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePlayerProfile() {
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    country: '',
    primaryPosition: '',
    phone: ''
  });

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/players`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      const { player } = await response.json();
      router.push(`/players/${player.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Formulaire complet */}
    </form>
  );
}
```

---

## Évolutions Futures

### V1
- Galerie photos étendue (5 photos) - SPEC-V1-001
- Biographie joueur - SPEC-V1-002
- Statistiques joueur - SPEC-V1-003
- Statut disponibilité - SPEC-V1-004
- Langues parlées - SPEC-V1-005

### V2
- Badges de confiance - SPEC-V1-014
- Profils boostés (premium) - SPEC-V2-001
- Statistiques détaillées avec graphiques - SPEC-V2-004

---

**Statut:** ✅ Spécification complète et prête pour implémentation
**Créé le:** 2026-02-02
**Dernière mise à jour:** 2026-02-02
