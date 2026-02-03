# SPEC-MVP-009: API Recherche Joueurs

**Phase:** MVP
**Sprint:** 2
**Domaine:** Player Search
**Priorité:** Critique
**Dépendances:** SPEC-MVP-004 (Profil Joueur), SPEC-MVP-007 (Profil Recruteur), SPEC-MVP-008 (Admin)

---

## Description

API de recherche permettant aux recruteurs approuvés de trouver des joueurs selon différents critères (position, âge, pays). Inclut pagination, tri des résultats, et protection par statut recruteur approuvé. Fonctionnalité centrale de la plateforme ScoutMe.

---

## Requirements

### REQ-SEARCH-001: Approved Recruiter Only
The system SHALL restrict player search to recruiters with status 'approved'.

### REQ-SEARCH-002: Multiple Filters
The system SHALL support filtering by position, age range, and country.

### REQ-SEARCH-003: Active Players Only
The system SHALL return only players with status 'active' in search results.

### REQ-SEARCH-004: Pagination Support
The system SHALL paginate search results with configurable page size.

### REQ-SEARCH-005: Sorting Options
The system SHALL support sorting by creation date and age.

### REQ-SEARCH-006: Performance
The system SHALL respond to search queries in less than 3 seconds.

---

## Endpoint API

### GET /api/players/search
**Description:** Rechercher des joueurs selon critères multiples

**Authentication:** Requiert JWT access token + recruiter approuvé

**Middleware:** requireAuth, requireApprovedRecruiter

**Query Parameters:**

| Paramètre | Type | Obligatoire | Description |
|-----------|------|-------------|-------------|
| `position` | string | Non | Position principale (ex: "Striker", "Goalkeeper") |
| `ageMin` | number | Non | Âge minimum (13-45) |
| `ageMax` | number | Non | Âge maximum (13-45) |
| `country` | string | Non | Pays du joueur |
| `page` | number | Non | Numéro de page (défaut: 1) |
| `limit` | number | Non | Résultats par page (défaut: 20, max: 100) |
| `sortBy` | string | Non | Champ de tri: "createdAt", "age" (défaut: "createdAt") |
| `sortOrder` | string | Non | Ordre: "asc", "desc" (défaut: "desc") |

**Response 200 OK:**
```json
{
  "players": [
    {
      "id": "uuid",
      "fullName": "John Doe",
      "birthDate": "2000-05-15",
      "age": 25,
      "country": "France",
      "city": "Paris",
      "primaryPosition": "Striker",
      "secondaryPositions": ["Winger", "Forward"],
      "foot": "right",
      "height": 180,
      "weight": 75,
      "profilePhotoUrl": "https://cloudinary.com/...",
      "videoUrls": [
        {
          "url": "https://youtube.com/watch?v=...",
          "title": "Highlights 2025",
          "thumbnailUrl": "https://img.youtube.com/..."
        }
      ],
      "createdAt": "2026-02-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  },
  "filters": {
    "position": "Striker",
    "ageMin": 20,
    "ageMax": 30,
    "country": "France"
  }
}
```

**Response 403 Forbidden (Recruiter not approved):**
```json
{
  "error": "Votre compte recruteur est en attente de validation",
  "code": "RECRUITER_NOT_APPROVED",
  "status": "pending"
}
```

**Response 400 Bad Request (Invalid parameters):**
```json
{
  "error": "Paramètres invalides",
  "code": "SEARCH_INVALID_PARAMS",
  "details": [
    {
      "field": "ageMin",
      "message": "L'âge minimum doit être entre 13 et 45 ans"
    }
  ]
}
```

---

## Filtres de Recherche

### Position (primaryPosition)

**Valeurs valides:** 14 positions football

```typescript
const POSITIONS = [
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
];
```

**Matching:** Recherche sur primaryPosition ET secondaryPositions

**Exemple:**
```
GET /api/players/search?position=Striker
→ Retourne joueurs avec primaryPosition="Striker" OU "Striker" dans secondaryPositions
```

### Âge (calculé depuis birthDate)

**Range valide:** 13-45 ans

**Paramètres:**
- `ageMin` (optionnel, défaut: 13)
- `ageMax` (optionnel, défaut: 45)

**Validation:**
- ageMin >= 13
- ageMax <= 45
- ageMin <= ageMax

**Calcul:** Âge = année courante - année de naissance

**Exemple:**
```
GET /api/players/search?ageMin=20&ageMax=25
→ Retourne joueurs ayant entre 20 et 25 ans
```

### Pays (country)

**Format:** String (nom pays en anglais ou français)

**Matching:** Recherche insensible à la casse (case-insensitive)

**Exemples:**
```
GET /api/players/search?country=France
GET /api/players/search?country=france
→ Les deux retournent joueurs de France
```

---

## Pagination

### Paramètres

- `page` (défaut: 1, min: 1)
- `limit` (défaut: 20, min: 1, max: 100)

### Format Réponse

```json
{
  "pagination": {
    "total": 156,        // Total résultats trouvés
    "page": 2,           // Page actuelle
    "limit": 20,         // Résultats par page
    "totalPages": 8      // Nombre total de pages
  }
}
```

### Calculs

```typescript
const skip = (page - 1) * limit;
const totalPages = Math.ceil(total / limit);
```

---

## Tri des Résultats

### Options de Tri

| sortBy | Description |
|--------|-------------|
| `createdAt` | Date de création du profil (défaut) |
| `age` | Âge du joueur (calculé) |

| sortOrder | Description |
|-----------|-------------|
| `desc` | Décroissant (défaut) |
| `asc` | Croissant |

### Exemples

```bash
# Plus récents en premier (défaut)
GET /api/players/search

# Plus anciens en premier
GET /api/players/search?sortBy=createdAt&sortOrder=asc

# Plus jeunes en premier
GET /api/players/search?sortBy=age&sortOrder=asc

# Plus âgés en premier
GET /api/players/search?sortBy=age&sortOrder=desc
```

---

## Logique Métier

### Service: player.service.ts (ajout fonction)

```typescript
/**
 * Rechercher des joueurs selon critères
 */
export async function searchPlayers(filters: SearchFilters, pagination: PaginationParams) {
  const { position, ageMin, ageMax, country } = filters;
  const { page, limit, sortBy, sortOrder } = pagination;

  // Construire la requête Prisma
  const where: Prisma.PlayerWhereInput = {
    status: 'active', // Seulement joueurs actifs
  };

  // Filtre position (primaryPosition OU dans secondaryPositions)
  if (position) {
    where.OR = [
      { primaryPosition: position },
      { secondaryPositions: { has: position } }
    ];
  }

  // Filtre pays (case-insensitive)
  if (country) {
    where.country = {
      equals: country,
      mode: 'insensitive'
    };
  }

  // Filtre âge (calculé via birthDate)
  if (ageMin || ageMax) {
    const today = new Date();
    const maxBirthDate = ageMin
      ? new Date(today.getFullYear() - ageMin, today.getMonth(), today.getDate())
      : undefined;
    const minBirthDate = ageMax
      ? new Date(today.getFullYear() - ageMax - 1, today.getMonth(), today.getDate())
      : undefined;

    where.birthDate = {
      ...(minBirthDate && { gte: minBirthDate }),
      ...(maxBirthDate && { lte: maxBirthDate })
    };
  }

  // Pagination
  const skip = (page - 1) * limit;

  // Tri
  const orderBy = sortBy === 'age'
    ? { birthDate: sortOrder === 'asc' ? 'desc' : 'asc' } // Inversé car âge = année - birthDate
    : { createdAt: sortOrder };

  // Exécuter requête
  const [players, total] = await Promise.all([
    prisma.player.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            email: false // Ne pas exposer l'email dans la recherche
          }
        }
      }
    }),
    prisma.player.count({ where })
  ]);

  return {
    players,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}
```

---

## Validation des Paramètres

### Schéma Zod: Search Query

```typescript
import { z } from 'zod';

const VALID_POSITIONS = [
  'Goalkeeper', 'Center Back', 'Left Back', 'Right Back', 'Wing Back',
  'Defensive Midfielder', 'Central Midfielder', 'Attacking Midfielder',
  'Left Midfielder', 'Right Midfielder', 'Winger',
  'Striker', 'Forward', 'Second Striker'
] as const;

export const searchPlayersSchema = z.object({
  position: z.enum(VALID_POSITIONS as [string, ...string[]]).optional(),

  ageMin: z.coerce.number()
    .int('L\'âge minimum doit être un entier')
    .min(13, 'L\'âge minimum doit être au moins 13 ans')
    .max(45, 'L\'âge minimum ne peut pas dépasser 45 ans')
    .optional(),

  ageMax: z.coerce.number()
    .int('L\'âge maximum doit être un entier')
    .min(13, 'L\'âge maximum doit être au moins 13 ans')
    .max(45, 'L\'âge maximum ne peut pas dépasser 45 ans')
    .optional(),

  country: z.string()
    .min(2, 'Le pays doit contenir au moins 2 caractères')
    .max(100, 'Le pays ne peut pas dépasser 100 caractères')
    .trim()
    .optional(),

  page: z.coerce.number()
    .int('La page doit être un entier')
    .min(1, 'La page doit être au moins 1')
    .optional()
    .default(1),

  limit: z.coerce.number()
    .int('La limite doit être un entier')
    .min(1, 'La limite doit être au moins 1')
    .max(100, 'La limite ne peut pas dépasser 100')
    .optional()
    .default(20),

  sortBy: z.enum(['createdAt', 'age']).optional().default('createdAt'),

  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
}).refine(
  (data) => {
    if (data.ageMin && data.ageMax) {
      return data.ageMin <= data.ageMax;
    }
    return true;
  },
  {
    message: 'L\'âge minimum doit être inférieur ou égal à l\'âge maximum',
    path: ['ageMin']
  }
);

export type SearchPlayersInput = z.infer<typeof searchPlayersSchema>;
```

---

## Structure du Code

### Fichiers à modifier

```
backend/src/
├── services/
│   └── player.service.ts          # Ajouter searchPlayers()
├── controllers/
│   └── player.controller.ts       # Ajouter searchPlayers()
├── routes/
│   └── player.routes.ts           # Ajouter GET /search
└── validators/
    └── player.validator.ts        # Ajouter searchPlayersSchema
```

**Note:** Pas de nouveaux fichiers, seulement ajouts aux fichiers existants.

---

## Sécurité

### Contrôle d'Accès

**Endpoint protégé par:**
1. `requireAuth` - JWT valide obligatoire
2. `requireApprovedRecruiter` - Statut 'approved' vérifié

**Vérifications:**
- Le recruteur doit avoir un profil
- Le profil recruteur doit avoir status = 'approved'
- Sinon erreur 403 avec message explicite

### Données Exposées

**Inclus dans résultats:**
- Informations profil joueur complètes
- Vidéos YouTube avec miniatures
- Photo de profil

**Exclus:**
- Email du joueur (privacy)
- userId (internal)
- Champs admin (approvedBy, etc.)

### Rate Limiting

**Recommandation:** 100 requêtes / 15 minutes pour recherche

```typescript
const searchRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de requêtes de recherche, réessayez plus tard'
});
```

---

## Performance

### Optimisations

**1. Index Base de Données**

Déjà créés dans schema.prisma:
```prisma
@@index([country])
@@index([primaryPosition])
@@index([status])
```

**Nouveaux index recommandés:**
```prisma
@@index([birthDate])
@@index([createdAt])
@@index([status, country, primaryPosition]) // Composite index
```

**2. Pagination**

- Limit maximum: 100 résultats
- Skip/Take pour pagination efficace
- Count et findMany en parallèle (Promise.all)

**3. Projection Fields**

- Sélectionner seulement champs nécessaires
- Exclure champs lourds si non utilisés

---

## Tests à Implémenter

### Tests Unitaires (player.service.spec.ts)

- Search with no filters (all active players)
- Search by position (primary)
- Search by position (secondary)
- Search by age range (ageMin + ageMax)
- Search by country (case-insensitive)
- Search with multiple filters combined
- Sort by createdAt (asc/desc)
- Sort by age (asc/desc)
- Pagination (page 1, 2, 3)
- Limit enforcement (max 100)
- Only active players returned (status='active')

### Tests d'Intégration (player.routes.spec.ts)

- GET /search - Approved recruiter (200)
- GET /search - Pending recruiter (403)
- GET /search - Player user (403)
- GET /search - No auth (401)
- GET /search - Invalid position (400)
- GET /search - Invalid age range (400)
- GET /search - ageMin > ageMax (400)
- GET /search - Pagination works correctly
- GET /search - Sorting works correctly
- GET /search - No results returns empty array

---

## Exemples d'Utilisation

### Recherche Simple

```bash
# Tous les joueurs actifs (page 1, 20 résultats)
GET /api/players/search

# Strikers uniquement
GET /api/players/search?position=Striker

# Joueurs de France
GET /api/players/search?country=France

# Jeunes joueurs (18-22 ans)
GET /api/players/search?ageMin=18&ageMax=22
```

### Recherche Combinée

```bash
# Strikers français entre 20 et 25 ans
GET /api/players/search?position=Striker&country=France&ageMin=20&ageMax=25

# Gardiens expérimentés (30-40 ans), triés du plus âgé au plus jeune
GET /api/players/search?position=Goalkeeper&ageMin=30&ageMax=40&sortBy=age&sortOrder=desc
```

### Pagination

```bash
# Page 1 (20 résultats par défaut)
GET /api/players/search?position=Striker

# Page 2
GET /api/players/search?position=Striker&page=2

# Page 1 avec 50 résultats
GET /api/players/search?position=Striker&limit=50

# Page 3 avec 10 résultats
GET /api/players/search?position=Striker&page=3&limit=10
```

---

## Workflow Utilisateur

### Recruteur Recherche des Joueurs

1. **Recruteur se connecte** (JWT obtenu)
2. **Recruteur a status 'approved'** (validé par admin)
3. **Recruteur accède** à la page de recherche
4. **Frontend affiche** filtres (position, âge, pays)
5. **Recruteur sélectionne** critères:
   - Position: "Striker"
   - Âge: 20-25 ans
   - Pays: "France"
6. **Frontend envoie** GET /api/players/search avec params
7. **Backend vérifie** statut recruteur approuvé
8. **Backend exécute** recherche avec filtres
9. **Backend retourne** résultats paginés
10. **Frontend affiche** liste joueurs avec:
    - Photo profil
    - Nom, âge, position
    - Pays, ville
    - Miniatures vidéos
    - Bouton "Voir profil"
11. **Recruteur clique** sur un joueur
12. **Frontend redirige** vers profil joueur complet
13. **Recruteur voit** téléphone/email pour contact

---

## Cas d'Erreur

### Recruteur Non Approuvé

```json
Request: GET /api/players/search
Token: Recruiter avec status='pending'

Response 403:
{
  "error": "Votre compte recruteur est en attente de validation",
  "code": "RECRUITER_NOT_APPROVED",
  "status": "pending"
}
```

### Paramètres Invalides

```json
Request: GET /api/players/search?ageMin=50&ageMax=10

Response 400:
{
  "error": "Paramètres invalides",
  "code": "SEARCH_INVALID_PARAMS",
  "details": [
    {
      "field": "ageMin",
      "message": "L'âge minimum doit être inférieur ou égal à l'âge maximum"
    }
  ]
}
```

---

## Critères d'Acceptation

- [ ] Un recruteur approuvé peut rechercher des joueurs
- [ ] Un recruteur pending reçoit 403 Forbidden
- [ ] Filtre par position fonctionne (primary ET secondary)
- [ ] Filtre par âge fonctionne (ageMin, ageMax)
- [ ] Filtre par pays fonctionne (case-insensitive)
- [ ] Filtres multiples peuvent être combinés
- [ ] Pagination fonctionne correctement
- [ ] Tri par createdAt fonctionne (asc/desc)
- [ ] Tri par age fonctionne (asc/desc)
- [ ] Seulement joueurs actifs retournés
- [ ] Email joueur non exposé dans résultats
- [ ] Validation Zod rejette paramètres invalides
- [ ] Performance < 3 secondes
- [ ] Tous les tests unitaires et d'intégration passent

---

## Évolutions Futures

### V1
- Recherche textuelle (full-text search sur nom, bio)
- Filtres avancés (pied préféré, taille, poids)
- Filtre par disponibilité (looking_for_club)
- Tri par pertinence (ranking algorithm)
- Sauvegarde de recherches (favoris)

### V2
- Recherche par rayon géographique (lat/long)
- Filtres statistiques (goals, assists, etc.)
- Recherche similaire (find similar players)
- Suggestions intelligentes (AI-powered)
- Export résultats (PDF, CSV)

---

## Notes d'Implémentation

### Calcul de l'Âge

**Important:** Utiliser la fonction existante `calculateAge()` de `player.utils.ts`

```typescript
import { calculateAge } from '../utils/player.utils';

// Dans la réponse
const playerWithAge = {
  ...player,
  age: calculateAge(player.birthDate)
};
```

### Filtre Position Array

**Prisma:** Utiliser `has` pour rechercher dans array

```typescript
{
  secondaryPositions: { has: position }
}
```

### Case-Insensitive Search

**Prisma:** Utiliser `mode: 'insensitive'`

```typescript
{
  country: {
    equals: country,
    mode: 'insensitive'
  }
}
```

---

**Statut:** Spécification complète et prête pour implémentation
**Créé le:** 2026-02-03
**Dernière mise à jour:** 2026-02-03
