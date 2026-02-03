# Guide de Test - API Profil Recruteur

**SPEC:** SPEC-MVP-007
**Date:** 2026-02-03
**Backend:** http://localhost:5000

---

## Prérequis

1. Serveur backend démarré:
```bash
cd backend
npm run dev
```

2. Base de données PostgreSQL active avec les migrations appliquées

3. Variables d'environnement configurées (.env)

---

## Workflow de Test Complet

### Étape 1: Créer un compte recruteur

**Endpoint:** POST /api/auth/register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recruiter@fcbarcelona.com",
    "password": "Password123!",
    "userType": "recruiter"
  }'
```

**Réponse attendue (201):**
```json
{
  "message": "Utilisateur créé avec succès. Veuillez vérifier votre email.",
  "user": {
    "id": "uuid",
    "email": "recruiter@fcbarcelona.com",
    "userType": "recruiter"
  }
}
```

**Note:** Dans un environnement de test, vous pouvez marquer l'email comme vérifié directement dans la base de données.

---

### Étape 2: Se connecter

**Endpoint:** POST /api/auth/login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recruiter@fcbarcelona.com",
    "password": "Password123!"
  }'
```

**Réponse attendue (200):**
```json
{
  "message": "Connexion réussie",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "recruiter@fcbarcelona.com",
    "userType": "recruiter"
  }
}
```

**ACTION:** Copier le `accessToken` pour les requêtes suivantes.

---

### Étape 3: Créer le profil recruteur

**Endpoint:** POST /api/recruiters

```bash
# Remplacer YOUR_ACCESS_TOKEN par le token obtenu
curl -X POST http://localhost:5000/api/recruiters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "fullName": "Jean Dupont",
    "organizationName": "FC Barcelona Academy",
    "organizationType": "academy",
    "country": "Spain",
    "contactEmail": "j.dupont@fcb.com",
    "contactPhone": "+34 123456789"
  }'
```

**Réponse attendue (201):**
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
    "createdAt": "2026-02-03T...",
    "updatedAt": "2026-02-03T..."
  }
}
```

**Vérifications:**
- Status par défaut = "pending"
- approvedBy et approvedAt sont null

---

### Étape 4: Récupérer mon profil recruteur

**Endpoint:** GET /api/recruiters/me

```bash
curl -X GET http://localhost:5000/api/recruiters/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Réponse attendue (200):**
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
    "createdAt": "2026-02-03T...",
    "updatedAt": "2026-02-03T..."
  }
}
```

---

### Étape 5: Récupérer un profil par ID

**Endpoint:** GET /api/recruiters/:id

```bash
# Remplacer RECRUITER_ID par l'ID du profil
curl -X GET http://localhost:5000/api/recruiters/RECRUITER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Réponse attendue (200):**
```json
{
  "recruiter": {
    "id": "uuid",
    "userId": "uuid",
    "fullName": "Jean Dupont",
    ...
  }
}
```

**Note:** Seul le owner ou un admin peut accéder à ce endpoint.

---

### Étape 6: Mettre à jour le profil

**Endpoint:** PUT /api/recruiters/:id

```bash
# Remplacer RECRUITER_ID par l'ID du profil
curl -X PUT http://localhost:5000/api/recruiters/RECRUITER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "fullName": "Jean Dupont Updated",
    "organizationName": "FC Barcelona Academy Europe",
    "contactPhone": "+34 987654321"
  }'
```

**Réponse attendue (200):**
```json
{
  "message": "Profil recruteur mis à jour avec succès",
  "recruiter": {
    "id": "uuid",
    "fullName": "Jean Dupont Updated",
    "organizationName": "FC Barcelona Academy Europe",
    "contactPhone": "+34 987654321",
    ...
  }
}
```

**Vérifications:**
- Seuls les champs fournis sont modifiés
- Le status reste "pending" (non modifiable par le recruteur)

---

### Étape 7: Supprimer le profil (soft delete)

**Endpoint:** DELETE /api/recruiters/:id

```bash
# Remplacer RECRUITER_ID par l'ID du profil
curl -X DELETE http://localhost:5000/api/recruiters/RECRUITER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Réponse attendue (200):**
```json
{
  "message": "Profil recruteur supprimé avec succès"
}
```

**Vérification dans la base de données:**
```sql
SELECT id, full_name, status FROM recruiters WHERE id = 'RECRUITER_ID';
-- Le status devrait être "suspended"
```

---

## Tests d'Erreur

### Erreur 1: Créer un profil sans authentification

```bash
curl -X POST http://localhost:5000/api/recruiters \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "organizationName": "Test Org",
    "organizationType": "club",
    "country": "France",
    "contactPhone": "+33123456789"
  }'
```

**Réponse attendue (401):**
```json
{
  "error": "Token d'authentification manquant",
  "code": "AUTH_TOKEN_MISSING"
}
```

---

### Erreur 2: Créer un profil avec un utilisateur joueur

**Prérequis:** Se connecter avec un compte de type 'player'

```bash
curl -X POST http://localhost:5000/api/recruiters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PLAYER_ACCESS_TOKEN" \
  -d '{
    "fullName": "Test User",
    "organizationName": "Test Org",
    "organizationType": "club",
    "country": "France",
    "contactPhone": "+33123456789"
  }'
```

**Réponse attendue (403):**
```json
{
  "error": "Accès réservé aux recruteurs",
  "code": "AUTH_FORBIDDEN_RECRUITER_ONLY"
}
```

---

### Erreur 3: Créer un profil avec des données invalides

```bash
curl -X POST http://localhost:5000/api/recruiters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "fullName": "A",
    "organizationName": "",
    "organizationType": "invalid_type",
    "country": "",
    "contactPhone": "123"
  }'
```

**Réponse attendue (400):**
```json
{
  "error": "Données invalides",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "fullName",
      "message": "Le nom doit contenir au moins 2 caractères"
    },
    {
      "field": "organizationName",
      "message": "Le nom de l'organisation doit contenir au moins 2 caractères"
    },
    {
      "field": "organizationType",
      "message": "Type d'organisation invalide"
    },
    {
      "field": "country",
      "message": "Le pays est requis"
    },
    {
      "field": "contactPhone",
      "message": "Numéro de téléphone invalide"
    }
  ]
}
```

---

### Erreur 4: Créer un profil en double

**Prérequis:** Un profil recruteur existe déjà pour cet utilisateur

```bash
curl -X POST http://localhost:5000/api/recruiters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "fullName": "Jean Dupont",
    "organizationName": "FC Barcelona Academy",
    "organizationType": "academy",
    "country": "Spain",
    "contactPhone": "+34 123456789"
  }'
```

**Réponse attendue (409):**
```json
{
  "error": "Un profil recruteur existe déjà pour cet utilisateur",
  "code": "RECRUITER_PROFILE_EXISTS"
}
```

---

### Erreur 5: Modifier le profil d'un autre recruteur

**Prérequis:** Avoir 2 comptes recruteurs différents

```bash
# Connecté avec Recruteur A
curl -X PUT http://localhost:5000/api/recruiters/RECRUITER_B_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer RECRUITER_A_TOKEN" \
  -d '{
    "fullName": "Hacker"
  }'
```

**Réponse attendue (403):**
```json
{
  "error": "Vous ne pouvez modifier que votre propre profil",
  "code": "AUTH_FORBIDDEN_OWNERSHIP"
}
```

---

### Erreur 6: Récupérer un profil inexistant

```bash
curl -X GET http://localhost:5000/api/recruiters/00000000-0000-0000-0000-000000000000 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Réponse attendue (404):**
```json
{
  "error": "Profil recruteur introuvable",
  "code": "RECRUITER_NOT_FOUND"
}
```

---

## Types d'Organisation Valides

### Liste des types supportés

```json
{
  "club": "Club Professionnel",
  "academy": "Académie/Centre de Formation",
  "agency": "Agence de Joueurs",
  "other": "Autre"
}
```

### Tests pour chaque type

```bash
# Club
curl -X POST http://localhost:5000/api/recruiters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "fullName": "Marc Leroy",
    "organizationName": "PSG",
    "organizationType": "club",
    "country": "France",
    "contactPhone": "+33123456789"
  }'

# Académie
curl -X POST http://localhost:5000/api/recruiters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "fullName": "Sophie Martin",
    "organizationName": "La Masia",
    "organizationType": "academy",
    "country": "Spain",
    "contactPhone": "+34987654321"
  }'

# Agence
curl -X POST http://localhost:5000/api/recruiters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "fullName": "Ahmed Diallo",
    "organizationName": "ProSport Agency",
    "organizationType": "agency",
    "country": "Senegal",
    "contactPhone": "+221123456789"
  }'

# Autre
curl -X POST http://localhost:5000/api/recruiters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "fullName": "John Smith",
    "organizationName": "Independent Scout",
    "organizationType": "other",
    "country": "UK",
    "contactPhone": "+44123456789"
  }'
```

---

## Workflow de Validation (SPEC-MVP-008)

**Note:** La validation admin sera implémentée dans SPEC-MVP-008.

### États du recruteur

| Statut | Description | Accès recherche |
|--------|-------------|-----------------|
| pending | En attente validation | Non |
| approved | Validé par admin | Oui |
| rejected | Rejeté par admin | Non |
| suspended | Suspendu (abus) | Non |

**Workflow:**
1. Recruteur s'inscrit → status = "pending"
2. Admin valide → status = "approved"
3. Recruteur peut rechercher des joueurs
4. Si abus détecté → status = "suspended"

---

## Checklist de Test

### Tests Fonctionnels

- [ ] Créer un compte recruteur (userType = 'recruiter')
- [ ] Se connecter et obtenir un JWT
- [ ] Créer un profil recruteur avec données valides
- [ ] Vérifier status par défaut = "pending"
- [ ] Récupérer mon profil avec GET /me
- [ ] Récupérer un profil par ID (owner)
- [ ] Mettre à jour mon profil
- [ ] Supprimer mon profil (soft delete)
- [ ] Vérifier status = "suspended" après suppression

### Tests d'Erreur

- [ ] Créer profil sans authentification (401)
- [ ] Créer profil avec utilisateur joueur (403)
- [ ] Créer profil avec données invalides (400)
- [ ] Créer profil en double (409)
- [ ] Modifier le profil d'un autre recruteur (403)
- [ ] Récupérer un profil inexistant (404)
- [ ] Tester les 4 types d'organisation (club, academy, agency, other)

### Tests de Validation

- [ ] fullName min 2 chars, max 255 chars
- [ ] organizationName min 2 chars, max 255 chars
- [ ] organizationType valide (club, academy, agency, other)
- [ ] country min 2 chars, max 100 chars
- [ ] contactEmail format email valide (optionnel)
- [ ] contactPhone min 8 chars, max 50 chars

---

## PowerShell (Windows)

### Créer un profil recruteur

```powershell
$token = "YOUR_ACCESS_TOKEN"

$body = @{
    fullName = "Jean Dupont"
    organizationName = "FC Barcelona Academy"
    organizationType = "academy"
    country = "Spain"
    contactEmail = "j.dupont@fcb.com"
    contactPhone = "+34 123456789"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/recruiters" `
  -Method POST `
  -Headers @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
  } `
  -Body $body
```

### Récupérer mon profil

```powershell
$token = "YOUR_ACCESS_TOKEN"

Invoke-RestMethod -Uri "http://localhost:5000/api/recruiters/me" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
  }
```

---

## Prochaines Étapes

Après SPEC-MVP-007, implémenter:

1. **SPEC-MVP-008:** Dashboard Admin
   - Valider/rejeter recruteurs
   - Liste recruteurs pending
   - Modération joueurs

2. **SPEC-MVP-009:** API Recherche Joueurs
   - Filtres (position, âge, pays)
   - Pagination
   - Tri des résultats

3. **Tests Automatisés:**
   - Tests unitaires (recruiter.service.spec.ts)
   - Tests d'intégration (recruiter.routes.spec.ts)

---

**Dernière mise à jour:** 2026-02-03
**Statut:** Prêt pour test manuel
