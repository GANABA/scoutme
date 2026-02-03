# Guide de Test - API Admin Dashboard

**SPEC:** SPEC-MVP-008
**Date:** 2026-02-03
**Backend:** http://localhost:5000

---

## Prérequis

1. Serveur backend démarré:
```bash
cd backend
npm run dev
```

2. Base de données PostgreSQL avec des données de test:
   - Au moins 1 compte admin
   - Quelques recruteurs pending
   - Quelques joueurs actifs

3. Variables d'environnement configurées (.env)

---

## Créer un Compte Admin (Si nécessaire)

**Option 1: Via la base de données directement**

```sql
-- Créer un utilisateur admin
INSERT INTO users (id, email, password_hash, user_type, email_verified)
VALUES (
  gen_random_uuid(),
  'admin@scoutme.com',
  -- Hash du mot de passe 'Admin123!' (bcrypt, 10 rounds)
  '$2b$10$EXAMPLE_HASH',
  'admin',
  true
);
```

**Option 2: Modifier un utilisateur existant**

```sql
-- Changer un utilisateur existant en admin
UPDATE users
SET user_type = 'admin'
WHERE email = 'votre-email@example.com';
```

---

## Workflow de Test Complet

### Étape 1: Se connecter en tant qu'admin

**Endpoint:** POST /api/auth/login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@scoutme.com",
    "password": "Admin123!"
  }'
```

**Réponse attendue (200):**
```json
{
  "message": "Connexion réussie",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "admin@scoutme.com",
    "userType": "admin"
  }
}
```

**ACTION:** Copier le `accessToken` pour les requêtes suivantes.

---

### Étape 2: Récupérer les statistiques plateforme

**Endpoint:** GET /api/admin/stats

```bash
# Remplacer ADMIN_TOKEN par le token obtenu
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Réponse attendue (200):**
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

### Étape 3: Récupérer les recruteurs en attente

**Endpoint:** GET /api/admin/recruiters/pending

```bash
curl -X GET "http://localhost:5000/api/admin/recruiters/pending?page=1&limit=20" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Réponse attendue (200):**
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
      "approvedBy": null,
      "approvedAt": null,
      "createdAt": "2026-02-03T10:00:00Z",
      "updatedAt": "2026-02-03T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### Étape 4: Approuver un recruteur

**Endpoint:** PUT /api/admin/recruiters/:id/status

```bash
# Remplacer RECRUITER_ID par l'ID d'un recruteur pending
curl -X PUT http://localhost:5000/api/admin/recruiters/RECRUITER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "status": "approved"
  }'
```

**Réponse attendue (200):**
```json
{
  "message": "Statut du recruteur mis à jour avec succès",
  "recruiter": {
    "id": "uuid",
    "fullName": "Jean Dupont",
    "organizationName": "FC Barcelona Academy",
    "status": "approved",
    "approvedBy": "admin-uuid",
    "approvedAt": "2026-02-03T12:00:00Z",
    ...
  }
}
```

**Vérifications:**
- status = 'approved'
- approvedBy = admin userId
- approvedAt = timestamp actuel

---

### Étape 5: Rejeter un recruteur

**Endpoint:** PUT /api/admin/recruiters/:id/status

```bash
curl -X PUT http://localhost:5000/api/admin/recruiters/RECRUITER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "status": "rejected",
    "reason": "Organisation non vérifiable"
  }'
```

**Réponse attendue (200):**
```json
{
  "message": "Statut du recruteur mis à jour avec succès",
  "recruiter": {
    "id": "uuid",
    "fullName": "John Smith",
    "status": "rejected",
    "approvedBy": null,
    "approvedAt": null,
    ...
  }
}
```

---

### Étape 6: Récupérer tous les recruteurs (filtre par statut)

**Endpoint:** GET /api/admin/recruiters

```bash
# Tous les recruteurs
curl -X GET "http://localhost:5000/api/admin/recruiters?page=1&limit=20" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Seulement approved
curl -X GET "http://localhost:5000/api/admin/recruiters?status=approved&page=1&limit=20" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Seulement rejected
curl -X GET "http://localhost:5000/api/admin/recruiters?status=rejected" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

### Étape 7: Récupérer tous les joueurs

**Endpoint:** GET /api/admin/players

```bash
# Tous les joueurs
curl -X GET "http://localhost:5000/api/admin/players?page=1&limit=20" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Seulement actifs
curl -X GET "http://localhost:5000/api/admin/players?status=active" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Seulement suspendus
curl -X GET "http://localhost:5000/api/admin/players?status=suspended" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Réponse attendue (200):**
```json
{
  "players": [
    {
      "id": "uuid",
      "userId": "uuid",
      "fullName": "John Doe",
      "primaryPosition": "Striker",
      "country": "France",
      "birthDate": "2000-05-15",
      "age": 25,
      "status": "active",
      "createdAt": "2026-02-01T00:00:00Z",
      ...
    }
  ],
  "pagination": {
    "total": 180,
    "page": 1,
    "limit": 20,
    "totalPages": 9
  }
}
```

---

### Étape 8: Suspendre un joueur

**Endpoint:** PUT /api/admin/players/:id/status

```bash
# Remplacer PLAYER_ID par l'ID d'un joueur actif
curl -X PUT http://localhost:5000/api/admin/players/PLAYER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "status": "suspended",
    "reason": "Contenu inapproprié dans la bio"
  }'
```

**Réponse attendue (200):**
```json
{
  "message": "Statut du joueur mis à jour avec succès",
  "player": {
    "id": "uuid",
    "fullName": "John Doe",
    "status": "suspended",
    ...
  }
}
```

---

### Étape 9: Réactiver un joueur suspendu

**Endpoint:** PUT /api/admin/players/:id/status

```bash
curl -X PUT http://localhost:5000/api/admin/players/PLAYER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "status": "active",
    "reason": "Contenu corrigé après demande"
  }'
```

---

## Tests d'Erreur

### Erreur 1: Accès admin sans authentification

```bash
curl -X GET http://localhost:5000/api/admin/stats
```

**Réponse attendue (401):**
```json
{
  "error": "Token d'authentification manquant",
  "code": "AUTH_TOKEN_MISSING"
}
```

---

### Erreur 2: Accès admin avec compte non-admin

**Prérequis:** Se connecter avec un compte player ou recruiter

```bash
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer PLAYER_OR_RECRUITER_TOKEN"
```

**Réponse attendue (403):**
```json
{
  "error": "Accès réservé aux administrateurs",
  "code": "AUTH_FORBIDDEN_ADMIN_ONLY"
}
```

---

### Erreur 3: Changer statut avec valeur invalide

```bash
curl -X PUT http://localhost:5000/api/admin/recruiters/RECRUITER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "status": "invalid_status"
  }'
```

**Réponse attendue (400):**
```json
{
  "error": "Données invalides",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "status",
      "message": "Statut invalide"
    }
  ]
}
```

---

### Erreur 4: Changer statut d'un recruteur inexistant

```bash
curl -X PUT http://localhost:5000/api/admin/recruiters/00000000-0000-0000-0000-000000000000/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "status": "approved"
  }'
```

**Réponse attendue (404):**
```json
{
  "error": "Recruteur introuvable",
  "code": "RECRUITER_NOT_FOUND"
}
```

---

### Erreur 5: Changer statut d'un joueur inexistant

```bash
curl -X PUT http://localhost:5000/api/admin/players/00000000-0000-0000-0000-000000000000/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "status": "suspended"
  }'
```

**Réponse attendue (404):**
```json
{
  "error": "Joueur introuvable",
  "code": "PLAYER_NOT_FOUND"
}
```

---

## Statuts Valides

### Recruteur
- `pending` - En attente validation
- `approved` - Approuvé par admin
- `rejected` - Rejeté par admin
- `suspended` - Suspendu (abus)

### Joueur
- `active` - Actif (visible)
- `suspended` - Suspendu (invisible)

---

## PowerShell (Windows)

### Récupérer stats plateforme

```powershell
$token = "ADMIN_TOKEN"

Invoke-RestMethod -Uri "http://localhost:5000/api/admin/stats" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
  }
```

### Approuver un recruteur

```powershell
$token = "ADMIN_TOKEN"
$recruiterId = "RECRUITER_UUID"

$body = @{
    status = "approved"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/admin/recruiters/$recruiterId/status" `
  -Method PUT `
  -Headers @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
  } `
  -Body $body
```

### Suspendre un joueur

```powershell
$token = "ADMIN_TOKEN"
$playerId = "PLAYER_UUID"

$body = @{
    status = "suspended"
    reason = "Contenu inapproprié"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/admin/players/$playerId/status" `
  -Method PUT `
  -Headers @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
  } `
  -Body $body
```

---

## Checklist de Test

### Tests Fonctionnels Admin

- [ ] Se connecter avec compte admin
- [ ] Récupérer statistiques plateforme
- [ ] Voir recruteurs pending (GET /admin/recruiters/pending)
- [ ] Approuver un recruteur (status → approved)
- [ ] Rejeter un recruteur avec raison (status → rejected)
- [ ] Suspendre un recruteur (status → suspended)
- [ ] Voir tous les recruteurs (GET /admin/recruiters)
- [ ] Filtrer recruteurs par statut (approved, rejected, pending)
- [ ] Voir tous les joueurs (GET /admin/players)
- [ ] Suspendre un joueur (status → suspended)
- [ ] Réactiver un joueur (status → active)
- [ ] Vérifier approvedBy et approvedAt renseignés

### Tests d'Erreur

- [ ] Accès sans token (401)
- [ ] Accès avec compte non-admin (403)
- [ ] Statut invalide (400)
- [ ] Recruteur inexistant (404)
- [ ] Joueur inexistant (404)
- [ ] Raison trop courte si fournie (400)

### Tests de Pagination

- [ ] Page 1 avec limit 20
- [ ] Page 2 avec limit 10
- [ ] Total et totalPages corrects
- [ ] Limit maximum (100)

---

## Logs Serveur

Lors des actions admin, vérifier les logs serveur:

```
[ADMIN] admin-uuid changed recruiter recruiter-uuid status to approved
[ADMIN] admin-uuid changed player player-uuid status to suspended - Reason: Contenu inapproprié
```

---

## Workflow Complet Validation Recruteur

1. Recruteur s'inscrit → status = 'pending'
2. Admin voit liste pending (GET /admin/recruiters/pending)
3. Admin vérifie organisation (appel téléphone recommandé)
4. Admin approuve (PUT /admin/recruiters/:id/status { status: 'approved' })
5. Système enregistre approvedBy + approvedAt
6. Recruteur peut maintenant utiliser requireApprovedRecruiter middleware
7. Recruteur accède à la recherche de joueurs (SPEC-MVP-009)

---

## Prochaines Étapes

Après SPEC-MVP-008:

1. **SPEC-MVP-009:** API Recherche Joueurs
   - Filtres (position, âge, pays)
   - Protégé par requireApprovedRecruiter
   - Pagination résultats

2. **Frontend Admin (Sprint 2+):**
   - Dashboard admin avec stats
   - Liste recruteurs pending avec boutons
   - Liste joueurs avec modération

3. **Tests Automatisés:**
   - Tests unitaires (admin.service.spec.ts)
   - Tests d'intégration (admin.routes.spec.ts)

---

**Dernière mise à jour:** 2026-02-03
**Statut:** Prêt pour test manuel
