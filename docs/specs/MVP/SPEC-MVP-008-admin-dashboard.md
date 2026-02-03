# SPEC-MVP-008: Dashboard Admin Validation Recruteurs

**Phase:** MVP
**Sprint:** 1
**Domaine:** Admin Management
**Priorité:** Critique
**Dépendances:** SPEC-MVP-001, SPEC-MVP-007

---

## Description

Système d'administration pour valider les recruteurs en attente et modérer les profils joueurs. Permet aux administrateurs de gérer les inscriptions recruteurs (approuver/rejeter), suspendre des profils abusifs, et visualiser des statistiques basiques de la plateforme.

---

## Requirements

### REQ-ADMIN-001: Recruiter Validation
The system SHALL allow admins to approve or reject pending recruiter profiles.

### REQ-ADMIN-002: Status Change
The system MUST update recruiter status to 'approved' or 'rejected' with admin validation.

### REQ-ADMIN-003: Admin Authorization
The system SHALL restrict all admin endpoints to users with userType = 'admin'.

### REQ-ADMIN-004: Approval Tracking
The system MUST record admin ID and timestamp when approving/rejecting recruiter.

### REQ-ADMIN-005: Player Moderation
The system SHALL allow admins to suspend or reactivate player profiles.

### REQ-ADMIN-006: Platform Statistics
The system SHALL provide basic platform statistics (users count, pending recruiters).

---

## Endpoints API

### GET /api/admin/recruiters/pending
**Description:** Liste des recruteurs en attente de validation

**Authentication:** Requiert JWT access token + userType = 'admin'

**Query Parameters:**
- `page` (optional, default: 1) - Numéro de page
- `limit` (optional, default: 20) - Résultats par page

**Response 200 OK:**
```json
{
  "recruiters": [
    {
      "id": "uuid",
      "userId": "uuid",
      "fullName": "Jean Dupont",
      "organizationName": "FC Barcelona Academy",
      "organizationType": "academy",
      "country": "Spain",
      "contactEmail": "j.dupont@fcb.com",
      "contactPhone": "+34 123456789",
      "status": "pending",
      "createdAt": "2026-02-03T00:00:00Z",
      "user": {
        "email": "recruiter@fcb.com",
        "emailVerified": true,
        "createdAt": "2026-02-02T00:00:00Z"
      }
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### PUT /api/admin/recruiters/:id/status
**Description:** Changer le statut d'un recruteur (approuver/rejeter/suspendre)

**Authentication:** Requiert JWT access token + userType = 'admin'

**Request Body:**
```json
{
  "status": "approved|rejected|suspended (required)",
  "reason": "string (optional, recommandé pour rejected/suspended)"
}
```

**Response 200 OK:**
```json
{
  "message": "Statut du recruteur mis à jour avec succès",
  "recruiter": {
    "id": "uuid",
    "fullName": "Jean Dupont",
    "status": "approved",
    "approvedBy": "admin-uuid",
    "approvedAt": "2026-02-03T10:00:00Z"
  }
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Statut invalide",
  "code": "ADMIN_INVALID_STATUS"
}
```

**Response 404 Not Found:**
```json
{
  "error": "Recruteur introuvable",
  "code": "RECRUITER_NOT_FOUND"
}
```

---

### GET /api/admin/recruiters
**Description:** Liste complète des recruteurs (tous statuts)

**Authentication:** Requiert JWT access token + userType = 'admin'

**Query Parameters:**
- `status` (optional) - Filtrer par statut (pending|approved|rejected|suspended)
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response 200 OK:**
```json
{
  "recruiters": [...],
  "pagination": {...}
}
```

---

### GET /api/admin/players
**Description:** Liste complète des joueurs (tous statuts)

**Authentication:** Requiert JWT access token + userType = 'admin'

**Query Parameters:**
- `status` (optional) - Filtrer par statut (active|suspended)
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response 200 OK:**
```json
{
  "players": [
    {
      "id": "uuid",
      "userId": "uuid",
      "fullName": "John Doe",
      "primaryPosition": "Striker",
      "country": "France",
      "status": "active",
      "createdAt": "2026-02-03T00:00:00Z",
      "user": {
        "email": "player@example.com"
      }
    }
  ],
  "pagination": {...}
}
```

---

### PUT /api/admin/players/:id/status
**Description:** Changer le statut d'un joueur (suspendre/réactiver)

**Authentication:** Requiert JWT access token + userType = 'admin'

**Request Body:**
```json
{
  "status": "active|suspended (required)",
  "reason": "string (optional, recommandé pour suspended)"
}
```

**Response 200 OK:**
```json
{
  "message": "Statut du joueur mis à jour avec succès",
  "player": {
    "id": "uuid",
    "fullName": "John Doe",
    "status": "suspended"
  }
}
```

---

### GET /api/admin/stats
**Description:** Statistiques plateforme

**Authentication:** Requiert JWT access token + userType = 'admin'

**Response 200 OK:**
```json
{
  "stats": {
    "users": {
      "total": 245,
      "players": 180,
      "recruiters": 64,
      "admins": 1
    },
    "recruiters": {
      "total": 64,
      "pending": 12,
      "approved": 48,
      "rejected": 2,
      "suspended": 2
    },
    "players": {
      "total": 180,
      "active": 175,
      "suspended": 5
    },
    "recent": {
      "newUsersToday": 5,
      "newUsersThisWeek": 28,
      "pendingRecruiters": 12
    }
  }
}
```

---

## Structure du Code

### Fichiers à créer

```
backend/src/
├── services/
│   └── admin.service.ts           # Logique métier admin
├── controllers/
│   └── admin.controller.ts        # Handlers requêtes HTTP admin
├── routes/
│   └── admin.routes.ts            # Routes API admin
└── validators/
    └── admin.validator.ts         # Schémas Zod validation
```

---

## Validation des Données

### Schéma Zod: Change Recruiter Status

```typescript
import { z } from 'zod';

const RECRUITER_STATUSES = ['pending', 'approved', 'rejected', 'suspended'] as const;

export const changeRecruiterStatusSchema = z.object({
  status: z.enum(RECRUITER_STATUSES, {
    errorMap: () => ({ message: 'Statut invalide' })
  }),

  reason: z.string()
    .min(10, 'La raison doit contenir au moins 10 caractères')
    .max(500, 'La raison ne peut pas dépasser 500 caractères')
    .trim()
    .optional()
});

export type ChangeRecruiterStatusInput = z.infer<typeof changeRecruiterStatusSchema>;
```

### Schéma Zod: Change Player Status

```typescript
const PLAYER_STATUSES = ['active', 'suspended'] as const;

export const changePlayerStatusSchema = z.object({
  status: z.enum(PLAYER_STATUSES, {
    errorMap: () => ({ message: 'Statut invalide' })
  }),

  reason: z.string()
    .min(10, 'La raison doit contenir au moins 10 caractères')
    .max(500, 'La raison ne peut pas dépasser 500 caractères')
    .trim()
    .optional()
});

export type ChangePlayerStatusInput = z.infer<typeof changePlayerStatusSchema>;
```

---

## Logique Métier

### Service: admin.service.ts

```typescript
/**
 * Récupérer les recruteurs en attente de validation
 */
export async function getPendingRecruiters(page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [recruiters, total] = await Promise.all([
    prisma.recruiter.findMany({
      where: { status: 'pending' },
      include: {
        user: {
          select: {
            email: true,
            emailVerified: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit
    }),
    prisma.recruiter.count({
      where: { status: 'pending' }
    })
  ]);

  return {
    recruiters,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Changer le statut d'un recruteur
 */
export async function changeRecruiterStatus(
  recruiterId: string,
  adminId: string,
  status: RecruiterStatus,
  reason?: string
) {
  const recruiter = await prisma.recruiter.findUnique({
    where: { id: recruiterId }
  });

  if (!recruiter) {
    throw new Error('RECRUITER_NOT_FOUND');
  }

  const updatedRecruiter = await prisma.recruiter.update({
    where: { id: recruiterId },
    data: {
      status,
      approvedBy: status === 'approved' ? adminId : null,
      approvedAt: status === 'approved' ? new Date() : null
    }
  });

  // TODO: Envoyer email notification au recruteur (SPEC future)

  return updatedRecruiter;
}

/**
 * Récupérer les statistiques plateforme
 */
export async function getPlatformStats() {
  const [
    totalUsers,
    usersByType,
    recruitersByStatus,
    playersByStatus
  ] = await Promise.all([
    prisma.user.count(),

    prisma.user.groupBy({
      by: ['userType'],
      _count: true
    }),

    prisma.recruiter.groupBy({
      by: ['status'],
      _count: true
    }),

    prisma.player.groupBy({
      by: ['status'],
      _count: true
    })
  ]);

  // Format stats
  const stats = {
    users: {
      total: totalUsers,
      players: usersByType.find(u => u.userType === 'player')?._count || 0,
      recruiters: usersByType.find(u => u.userType === 'recruiter')?._count || 0,
      admins: usersByType.find(u => u.userType === 'admin')?._count || 0
    },
    recruiters: {
      total: recruitersByStatus.reduce((sum, r) => sum + r._count, 0),
      pending: recruitersByStatus.find(r => r.status === 'pending')?._count || 0,
      approved: recruitersByStatus.find(r => r.status === 'approved')?._count || 0,
      rejected: recruitersByStatus.find(r => r.status === 'rejected')?._count || 0,
      suspended: recruitersByStatus.find(r => r.status === 'suspended')?._count || 0
    },
    players: {
      total: playersByStatus.reduce((sum, p) => sum + p._count, 0),
      active: playersByStatus.find(p => p.status === 'active')?._count || 0,
      suspended: playersByStatus.find(p => p.status === 'suspended')?._count || 0
    }
  };

  return stats;
}
```

---

## Sécurité

### Contrôle d'Accès (RBAC)

**Tous les endpoints admin:**
- Authentification JWT requise
- Middleware `requireAdmin` (userType = 'admin')
- Aucun accès pour players ou recruiters

**Permissions:**
- Approuver/rejeter recruteurs
- Suspendre/réactiver joueurs
- Voir toutes les données utilisateurs
- Accéder aux statistiques plateforme

### Audit Trail

**À enregistrer:**
- adminId qui a effectué l'action
- Timestamp de l'action
- Ancien statut → Nouveau statut
- Raison fournie (si applicable)

**Note MVP:** L'audit trail complet sera implémenté en V1. Pour le MVP, on enregistre seulement `approvedBy` et `approvedAt` dans le modèle Recruiter.

---

## Workflow Validation Recruteur

```
1. Recruteur s'inscrit → status = 'pending'
2. Admin voit la liste des pending (GET /api/admin/recruiters/pending)
3. Admin examine le profil (organisation, contact)
4. Admin décide:
   a. Approuver → PUT /api/admin/recruiters/:id/status { status: 'approved' }
   b. Rejeter → PUT /api/admin/recruiters/:id/status { status: 'rejected', reason: '...' }
5. Status mis à jour dans la base
6. [Future] Email envoyé au recruteur
7. Recruteur peut maintenant accéder à la plateforme (si approved)
```

---

## Frontend (Hors scope MVP backend)

**Pages à créer (Sprint 2+):**
- `/admin/dashboard` - Dashboard principal
- `/admin/recruiters` - Liste recruteurs
- `/admin/recruiters/pending` - Recruteurs en attente
- `/admin/players` - Liste joueurs
- `/admin/stats` - Statistiques

**Composants clés:**
- RecruiterCard avec boutons Approve/Reject
- PlayerCard avec bouton Suspend
- StatsWidget affichage métriques
- ConfirmationModal pour actions critiques

---

## Tests à Implémenter

### Tests Unitaires (admin.service.spec.ts)

- Get pending recruiters with pagination
- Change recruiter status to approved
- Change recruiter status to rejected
- Change recruiter status to suspended
- Record admin ID when approving
- Change player status to suspended
- Change player status to active
- Get platform statistics
- Handle non-existent recruiter ID

### Tests d'Intégration (admin.routes.spec.ts)

- GET /api/admin/recruiters/pending - Admin access (200)
- GET /api/admin/recruiters/pending - Non-admin (403)
- GET /api/admin/recruiters/pending - No auth (401)
- PUT /api/admin/recruiters/:id/status - Approve (200)
- PUT /api/admin/recruiters/:id/status - Reject with reason (200)
- PUT /api/admin/recruiters/:id/status - Invalid status (400)
- PUT /api/admin/recruiters/:id/status - Non-existent ID (404)
- PUT /api/admin/recruiters/:id/status - Non-admin (403)
- PUT /api/admin/players/:id/status - Suspend player (200)
- GET /api/admin/stats - Admin access (200)

---

## Workflow Utilisateur Complet

### Admin Valide un Recruteur

1. **Admin se connecte** (userType = 'admin')
2. **Admin accède** à GET /api/admin/recruiters/pending
3. **Admin voit** liste des recruteurs en attente
4. **Admin examine** chaque profil:
   - Nom complet
   - Organisation et type
   - Email et téléphone
   - Date d'inscription
5. **Admin vérifie** légitimité (appel téléphonique recommandé)
6. **Admin approuve:**
   ```bash
   PUT /api/admin/recruiters/RECRUITER_ID/status
   { "status": "approved" }
   ```
7. **Système met à jour:**
   - status = 'approved'
   - approvedBy = adminId
   - approvedAt = now()
8. **Recruteur notifié** (email - V1)
9. **Recruteur peut maintenant** rechercher des joueurs

### Admin Modère un Joueur

1. **Admin accède** à GET /api/admin/players
2. **Admin identifie** profil abusif (signalement ou détection)
3. **Admin suspend:**
   ```bash
   PUT /api/admin/players/PLAYER_ID/status
   {
     "status": "suspended",
     "reason": "Contenu inapproprié dans bio"
   }
   ```
4. **Joueur suspendu** → invisible dans recherche
5. **Joueur peut contacter** support pour appel

---

## Critères d'Acceptation

- [ ] Un admin peut voir la liste des recruteurs pending
- [ ] Un admin peut approuver un recruteur (status → approved)
- [ ] Un admin peut rejeter un recruteur (status → rejected)
- [ ] Un admin peut suspendre un recruteur (status → suspended)
- [ ] Le champ approvedBy est renseigné avec l'ID de l'admin
- [ ] Le champ approvedAt est renseigné avec le timestamp
- [ ] Un admin peut voir tous les recruteurs (tous statuts)
- [ ] Un admin peut voir tous les joueurs
- [ ] Un admin peut suspendre un joueur
- [ ] Un admin peut réactiver un joueur suspendu
- [ ] Un admin peut voir les statistiques plateforme
- [ ] Les endpoints admin sont protégés (requireAdmin)
- [ ] Les non-admins reçoivent 403 Forbidden
- [ ] Tous les tests unitaires et d'intégration passent

---

## Évolutions Futures

### V1
- Audit trail complet (table AdminActions)
- Notifications email automatiques
- Historique des actions admin
- Recherche et filtres avancés
- Export CSV des utilisateurs
- Dashboard avec graphiques

### V2
- Système de signalement (players/recruiters)
- Modération de contenu (photos, vidéos)
- Ban permanent d'utilisateurs
- Gestion des rôles admin (super admin, moderator)
- Logs d'activité détaillés
- Métriques avancées (analytics)

---

## Notes d'Implémentation

### Pagination

**Défaut:** 20 résultats par page
**Maximum:** 100 résultats par page

```typescript
const limit = Math.min(req.query.limit || 20, 100);
const page = Math.max(req.query.page || 1, 1);
```

### Notifications (V1)

Lors de l'approbation/rejet, envoyer un email:

**Template Approved:**
```
Sujet: Votre compte recruteur ScoutMe a été validé

Bonjour [fullName],

Bonne nouvelle ! Votre compte recruteur sur ScoutMe a été validé.

Vous pouvez maintenant:
- Rechercher des joueurs talentueux
- Consulter leurs profils complets
- Contacter directement les joueurs

Connectez-vous: https://scoutme.com/login

L'équipe ScoutMe
```

**Template Rejected:**
```
Sujet: Votre demande de compte recruteur ScoutMe

Bonjour [fullName],

Après examen, nous ne pouvons pas valider votre compte recruteur.

Raison: [reason]

Pour plus d'informations, contactez-nous: support@scoutme.com

L'équipe ScoutMe
```

---

## Sécurité Additionnelle

### Rate Limiting (Admin)

**Recommandation:** Rate limiting plus restrictif pour les endpoints admin

```typescript
// 100 requêtes / 15 minutes pour admin (vs 1000 pour utilisateurs normaux)
const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

### Logging

**Actions à logger:**
- Tous les changements de statut (avec adminId)
- Accès aux listes complètes (privacy concern)
- Actions de modération (suspend, unsuspend)

```typescript
console.log(`[ADMIN] ${adminId} changed recruiter ${recruiterId} status to ${status}`);
```

---

**Statut:** Spécification complète et prête pour implémentation
**Créé le:** 2026-02-03
**Dernière mise à jour:** 2026-02-03
