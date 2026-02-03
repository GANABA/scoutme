# SPEC-MVP-007: Création Profil Recruteur

**Phase:** MVP
**Sprint:** 1
**Domaine:** Recruiter Management
**Priorité:** Critique
**Dépendances:** SPEC-MVP-001, SPEC-MVP-002

---

## Description

Système complet de gestion du profil recruteur avec workflow de validation manuelle par admin. Permet aux recruteurs (clubs, académies, agents) de s'inscrire et d'accéder à la plateforme après validation pour rechercher des joueurs.

---

## Requirements

### REQ-RECRUITER-001: Profile Creation
The system SHALL create recruiter profile after successful user registration with type 'recruiter'.

### REQ-RECRUITER-002: Mandatory Fields
The system MUST validate mandatory fields: fullName, organizationName, organizationType, country, contactPhone.

### REQ-RECRUITER-003: Default Status
The system SHALL set default status to 'pending' for new recruiter profiles.

### REQ-RECRUITER-004: Profile Uniqueness
The system SHALL ensure one recruiter profile per user (1:1 relationship with User).

### REQ-RECRUITER-005: Status Workflow
The system SHALL manage recruiter status workflow: pending → approved/rejected/suspended.

### REQ-RECRUITER-006: Authorization Control
The system MUST restrict profile editing to profile owner only (RBAC).

### REQ-RECRUITER-007: Admin Validation Required
The system SHALL require admin approval before recruiter can access player search.

---

## Workflow de Statut

```
        ┌──────────┐
        │ REGISTER │
        └────┬─────┘
             │
             ▼
        ┌─────────┐
        │ PENDING │ ◄── Default status
        └────┬────┘
             │
        ┌────┴────┐
        │  ADMIN  │
        │ REVIEWS │
        └────┬────┘
             │
     ┌───────┴───────┐
     ▼               ▼
┌──────────┐    ┌──────────┐
│ APPROVED │    │ REJECTED │
└────┬─────┘    └──────────┘
     │
     │ (si abus)
     ▼
┌───────────┐
│ SUSPENDED │
└───────────┘
```

**États:**
- **pending**: En attente validation admin (défaut)
- **approved**: Validé, accès complet plateforme
- **rejected**: Rejeté, pas d'accès
- **suspended**: Suspendu (abus détecté)

---

## Endpoints API

### POST /api/recruiters
**Description:** Créer un profil recruteur (lié à l'utilisateur authentifié)

**Authentication:** Requiert JWT access token + userType = 'recruiter'

**Request Body:**
```json
{
  "fullName": "string (required, max 255)",
  "organizationName": "string (required, max 255)",
  "organizationType": "club|academy|agency|other (required)",
  "country": "string (required, max 100)",
  "contactEmail": "string (optional, email format, max 255)",
  "contactPhone": "string (required, max 50)"
}
```

**Response 201 Created:**
```json
{
  "message": "Profil recruteur créé avec succès. En attente de validation.",
  "recruiter": {
    "id": "uuid",
    "userId": "uuid",
    "fullName": "Jean Dupont",
    "organizationName": "FC Barcelona Academy",
    "organizationType": "academy",
    "country": "Spain",
    "contactEmail": "j.dupont@fcb.com",
    "contactPhone": "+34 123456789",
    "status": "pending",
    "approvedBy": null,
    "approvedAt": null,
    "createdAt": "2026-02-03T00:00:00Z",
    "updatedAt": "2026-02-03T00:00:00Z"
  }
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Données invalides",
  "code": "RECRUITER_INVALID_DATA",
  "details": [
    {
      "field": "organizationType",
      "message": "Type d'organisation invalide"
    }
  ]
}
```

**Response 409 Conflict:**
```json
{
  "error": "Un profil recruteur existe déjà pour cet utilisateur",
  "code": "RECRUITER_PROFILE_EXISTS"
}
```

---

### GET /api/recruiters/:id
**Description:** Récupérer un profil recruteur par ID

**Authentication:** Requiert JWT access token + admin OR owner

**Response 200 OK:**
```json
{
  "recruiter": {
    "id": "uuid",
    "fullName": "Jean Dupont",
    "organizationName": "FC Barcelona Academy",
    "organizationType": "academy",
    "country": "Spain",
    "contactEmail": "j.dupont@fcb.com",
    "contactPhone": "+34 123456789",
    "status": "pending",
    "createdAt": "2026-02-03T00:00:00Z",
    "updatedAt": "2026-02-03T00:00:00Z"
  }
}
```

**Note:** Les champs approvedBy et approvedAt ne sont pas exposés publiquement.

---

### GET /api/recruiters/me
**Description:** Récupérer le profil du recruteur authentifié

**Authentication:** Requiert JWT access token + userType = 'recruiter'

**Response 200 OK:**
```json
{
  "recruiter": {
    "id": "uuid",
    "userId": "uuid",
    "fullName": "Jean Dupont",
    "organizationName": "FC Barcelona Academy",
    "organizationType": "academy",
    "country": "Spain",
    "contactEmail": "j.dupont@fcb.com",
    "contactPhone": "+34 123456789",
    "status": "pending",
    "approvedBy": null,
    "approvedAt": null,
    "createdAt": "2026-02-03T00:00:00Z",
    "updatedAt": "2026-02-03T00:00:00Z"
  }
}
```

**Response 404 Not Found:**
```json
{
  "error": "Aucun profil recruteur associé à cet utilisateur",
  "code": "RECRUITER_PROFILE_NOT_FOUND"
}
```

---

### PUT /api/recruiters/:id
**Description:** Mettre à jour un profil recruteur

**Authentication:** Requiert JWT access token + ownership (owner only)

**Request Body:** (Tous les champs optionnels sauf ceux modifiés)
```json
{
  "fullName": "string (optional)",
  "organizationName": "string (optional)",
  "organizationType": "club|academy|agency|other (optional)",
  "country": "string (optional)",
  "contactEmail": "string (optional)",
  "contactPhone": "string (optional)"
}
```

**Note:** Le statut ne peut être modifié que par un admin (voir SPEC-MVP-008).

**Response 200 OK:**
```json
{
  "message": "Profil recruteur mis à jour avec succès",
  "recruiter": {
    "id": "uuid",
    "fullName": "Jean Dupont Updated",
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

### DELETE /api/recruiters/:id
**Description:** Supprimer un profil recruteur (soft delete: status = 'suspended')

**Authentication:** Requiert JWT access token + (ownership OR admin)

**Response 200 OK:**
```json
{
  "message": "Profil recruteur supprimé avec succès"
}
```

**Note:** Seuls les admins peuvent faire un hard delete (cascade User).

---

## Schéma Base de Données

### Modèle Recruiter (déjà existant dans Prisma schema)

```prisma
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
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([status])
  @@map("recruiters")
}
```

---

## Types d'Organisation

### Types Valides

```typescript
export const ORGANIZATION_TYPES = [
  'club',      // Club professionnel
  'academy',   // Académie/Centre de formation
  'agency',    // Agence de joueurs
  'other'      // Autre (scout indépendant, etc.)
] as const;

export type OrganizationType = typeof ORGANIZATION_TYPES[number];
```

**Mapping pour affichage:**
```typescript
const ORGANIZATION_LABELS = {
  club: 'Club Professionnel',
  academy: 'Académie/Centre de Formation',
  agency: 'Agence de Joueurs',
  other: 'Autre'
};
```

---

## Validation des Données

### Schéma Zod: Create Recruiter Profile

```typescript
import { z } from 'zod';

const ORGANIZATION_TYPES = ['club', 'academy', 'agency', 'other'] as const;

export const createRecruiterSchema = z.object({
  fullName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(255, 'Le nom ne peut pas dépasser 255 caractères')
    .trim(),

  organizationName: z.string()
    .min(2, 'Le nom de l\'organisation doit contenir au moins 2 caractères')
    .max(255, 'Le nom de l\'organisation ne peut pas dépasser 255 caractères')
    .trim(),

  organizationType: z.enum(ORGANIZATION_TYPES, {
    errorMap: () => ({ message: 'Type d\'organisation invalide' })
  }),

  country: z.string()
    .min(2, 'Le pays est requis')
    .max(100, 'Le pays ne peut pas dépasser 100 caractères')
    .trim(),

  contactEmail: z.string()
    .email('Format email invalide')
    .max(255, 'L\'email ne peut pas dépasser 255 caractères')
    .toLowerCase()
    .trim()
    .optional(),

  contactPhone: z.string()
    .min(8, 'Numéro de téléphone invalide')
    .max(50, 'Numéro de téléphone trop long')
    .trim()
});

export const updateRecruiterSchema = createRecruiterSchema.partial();
```

---

## Logique Métier

### Formatage des Réponses

```typescript
export function formatRecruiterResponse(recruiter: Recruiter, includeAdminFields = false) {
  const base = {
    id: recruiter.id,
    fullName: recruiter.fullName,
    organizationName: recruiter.organizationName,
    organizationType: recruiter.organizationType,
    country: recruiter.country,
    contactEmail: recruiter.contactEmail,
    contactPhone: recruiter.contactPhone,
    status: recruiter.status,
    createdAt: recruiter.createdAt.toISOString(),
    updatedAt: recruiter.updatedAt.toISOString()
  };

  // Inclure champs admin seulement si owner ou admin
  if (includeAdminFields) {
    return {
      ...base,
      userId: recruiter.userId,
      approvedBy: recruiter.approvedBy,
      approvedAt: recruiter.approvedAt?.toISOString() || null
    };
  }

  return base;
}
```

---

## Structure du Code

### Fichiers à créer

```
backend/src/
├── services/
│   └── recruiter.service.ts         # Logique métier profils recruteurs
├── controllers/
│   └── recruiter.controller.ts      # Handlers requêtes HTTP
├── routes/
│   └── recruiter.routes.ts          # Routes API recruteurs
├── validators/
│   └── recruiter.validator.ts       # Schémas Zod validation
└── utils/
    └── recruiter.utils.ts           # Helpers formatage
```

---

## Sécurité

### Contrôle d'Accès (RBAC)

**Créer profil:**
- Utilisateur authentifié
- `userType` = 'recruiter'
- Pas de profil existant
- Status par défaut: 'pending'

**Lire profil:**
- Owner (voir son propre profil)
- Admin (voir tous les profils)

**Modifier profil:**
- Owner uniquement (pas de modification status)
- Admin peut modifier status (SPEC-MVP-008)

**Supprimer profil:**
- Owner (soft delete: status = 'suspended')
- Admin (hard delete possible)

### Restrictions par Statut

| Statut | Inscription | Login | Voir Profils Joueurs | Recherche |
|--------|-------------|-------|----------------------|-----------|
| pending | ✅ | ✅ | ❌ | ❌ |
| approved | N/A | ✅ | ✅ | ✅ |
| rejected | N/A | ✅ | ❌ | ❌ |
| suspended | N/A | ✅ | ❌ | ❌ |

**Note:** Les recruteurs non-approuvés peuvent se connecter mais ont un accès limité.

---

## Middleware: Require Approved Recruiter

```typescript
export function requireApprovedRecruiter(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.userType !== 'recruiter') {
    return res.status(403).json({
      error: 'Accès réservé aux recruteurs',
      code: 'AUTH_FORBIDDEN_RECRUITER_ONLY'
    });
  }

  // Vérifier le statut du recruteur
  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: req.user.userId }
  });

  if (!recruiter) {
    return res.status(404).json({
      error: 'Profil recruteur introuvable',
      code: 'RECRUITER_PROFILE_NOT_FOUND'
    });
  }

  if (recruiter.status !== 'approved') {
    return res.status(403).json({
      error: 'Votre compte recruteur est en attente de validation',
      code: 'RECRUITER_NOT_APPROVED',
      status: recruiter.status
    });
  }

  next();
}
```

**Usage:** Protéger les routes de recherche de joueurs (SPEC-MVP-009).

---

## Tests à Implémenter

### Tests Unitaires

**recruiter.service.spec.ts:**
- ✅ Create recruiter profile with valid data
- ✅ Create recruiter profile with existing userId (should fail)
- ✅ Default status is 'pending'
- ✅ Get recruiter by ID
- ✅ Get recruiter by userId
- ✅ Update recruiter profile
- ✅ Update status (admin only logic)
- ✅ Delete recruiter profile (soft delete)

### Tests d'Intégration

**recruiter.routes.spec.ts:**
- ✅ POST /api/recruiters - Authenticated recruiter user
- ✅ POST /api/recruiters - Unauthenticated (should fail 401)
- ✅ POST /api/recruiters - Player user (should fail 403)
- ✅ POST /api/recruiters - Duplicate profile (should fail 409)
- ✅ GET /api/recruiters/:id - Owner access
- ✅ GET /api/recruiters/:id - Admin access
- ✅ GET /api/recruiters/:id - Other user (should fail 403)
- ✅ GET /api/recruiters/me - Authenticated recruiter
- ✅ PUT /api/recruiters/:id - Owner only
- ✅ PUT /api/recruiters/:id - Non-owner (should fail 403)
- ✅ DELETE /api/recruiters/:id - Owner only

---

## Workflow Utilisateur

### Flux Création de Profil Recruteur

1. **Utilisateur s'inscrit** avec `userType = 'recruiter'` (SPEC-MVP-001)
2. **Utilisateur valide email** (SPEC-MVP-002)
3. **Frontend redirige** vers formulaire création profil recruteur
4. **Utilisateur remplit** formulaire (nom, organisation, type, pays, contact)
5. **Frontend envoie** POST /api/recruiters avec JWT access token
6. **Backend crée** profil recruteur avec status = 'pending'
7. **Frontend affiche** message "En attente de validation par un administrateur"
8. **Recruteur attend** validation admin (SPEC-MVP-008)
9. **Admin valide** profil → status = 'approved'
10. **Recruteur reçoit** notification (email)
11. **Recruteur accède** à la recherche de joueurs

### Message d'Attente (Frontend)

```tsx
{recruiter.status === 'pending' && (
  <Alert variant="warning">
    <h3>Compte en attente de validation</h3>
    <p>
      Votre profil recruteur est en cours de vérification par notre équipe.
      Vous recevrez un email dès que votre compte sera validé.
    </p>
    <p>
      <strong>Délai estimé:</strong> 24-48 heures
    </p>
  </Alert>
)}

{recruiter.status === 'rejected' && (
  <Alert variant="error">
    <h3>Compte rejeté</h3>
    <p>
      Votre demande de compte recruteur a été rejetée.
      Veuillez contacter support@scoutme.com pour plus d'informations.
    </p>
  </Alert>
)}

{recruiter.status === 'approved' && (
  <Alert variant="success">
    <h3>Compte validé</h3>
    <p>Votre compte recruteur est actif. Vous pouvez maintenant rechercher des joueurs.</p>
  </Alert>
)}
```

---

## Critères d'Acceptation

- [ ] Un recruteur peut créer son profil après inscription
- [ ] Un utilisateur ne peut avoir qu'un seul profil recruteur
- [ ] Les champs obligatoires sont validés (nom, organisation, type, pays, téléphone)
- [ ] Type d'organisation validé contre liste prédéfinie
- [ ] Status par défaut est 'pending'
- [ ] Un recruteur peut voir son propre profil complet
- [ ] Un recruteur peut modifier uniquement son propre profil (pas le status)
- [ ] Les recruteurs 'pending' ne peuvent pas rechercher de joueurs
- [ ] Tous les tests unitaires et d'intégration passent

---

## Notes d'Implémentation

### Frontend (Next.js)

**Pages à créer:**
- `/recruiters/create` - Formulaire création profil
- `/dashboard/recruiter` - Dashboard recruteur
- `/dashboard/recruiter/profile` - Formulaire édition profil
- `/dashboard/recruiter/status` - Affichage statut validation

**Composants:**
```typescript
// app/recruiters/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateRecruiterProfile() {
  const [formData, setFormData] = useState({
    fullName: '',
    organizationName: '',
    organizationType: 'club',
    country: '',
    contactPhone: '',
    contactEmail: ''
  });

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recruiters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      const { recruiter } = await response.json();
      router.push('/dashboard/recruiter');
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
- Logo organisation (upload image)
- Description organisation (textarea)
- Site web organisation (URL)
- Adresse complète
- Certification/Licences

### V2
- Système de réputation - SPEC-V2-015
- Historique recherches - SPEC-V1-012
- Watchlist/Favoris - SPEC-V1-011
- Messagerie interne - SPEC-V2-009
- Système de crédits - SPEC-V2-005

---

**Statut:** ✅ Spécification complète et prête pour implémentation
**Créé le:** 2026-02-03
**Dernière mise à jour:** 2026-02-03
