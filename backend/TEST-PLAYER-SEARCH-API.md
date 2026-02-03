# Guide de Test - API Recherche Joueurs

**SPEC:** SPEC-MVP-009
**Date:** 2026-02-03
**Backend:** http://localhost:5000

---

## Prérequis

1. Serveur backend démarré:
```bash
cd backend
npm run dev
```

2. Base de données avec des données de test:
   - Au moins 1 recruteur approuvé (status='approved')
   - Plusieurs joueurs actifs avec positions variées
   - Joueurs de différents pays et âges

3. Variables d'environnement configurées (.env)

---

## Créer un Recruteur Approuvé (Si nécessaire)

### Méthode 1: Via SQL (plus rapide pour test)

```sql
-- 1. Créer user recruteur
INSERT INTO users (id, email, password_hash, user_type, email_verified)
VALUES (
  gen_random_uuid(),
  'recruiter.approved@test.com',
  '$2b$10$EXAMPLE_HASH', -- Hash de 'Password123!'
  'recruiter',
  true
);

-- 2. Créer profil recruteur avec status approved
INSERT INTO recruiters (id, user_id, full_name, organization_name, organization_type, country, contact_phone, status, approved_by, approved_at)
SELECT
  gen_random_uuid(),
  id,
  'Test Recruiter',
  'Test FC',
  'club',
  'France',
  '+33123456789',
  'approved',
  (SELECT id FROM users WHERE user_type = 'admin' LIMIT 1),
  NOW()
FROM users WHERE email = 'recruiter.approved@test.com';
```

### Méthode 2: Via l'API (complet)

```bash
# 1. S'inscrire
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recruiter.approved@test.com",
    "password": "Password123!",
    "userType": "recruiter"
  }'

# 2. Se connecter
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recruiter.approved@test.com",
    "password": "Password123!"
  }'

# 3. Créer profil recruteur
curl -X POST http://localhost:5000/api/recruiters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "fullName": "Test Recruiter",
    "organizationName": "Test FC",
    "organizationType": "club",
    "country": "France",
    "contactPhone": "+33123456789"
  }'

# 4. Admin approuve le recruteur (nécessite token admin)
curl -X PUT http://localhost:5000/api/admin/recruiters/RECRUITER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"status":"approved"}'
```

---

## Workflow de Test Complet

### Étape 1: Se connecter en tant que recruteur approuvé

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recruiter.approved@test.com",
    "password": "Password123!"
  }'
```

**ACTION:** Copier le `accessToken` pour les requêtes suivantes.

---

### Étape 2: Recherche simple (tous les joueurs actifs)

**Endpoint:** GET /api/players/search

```bash
curl -X GET "http://localhost:5000/api/players/search" \
  -H "Authorization: Bearer YOUR_APPROVED_RECRUITER_TOKEN"
```

**Réponse attendue (200):**
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
      "secondaryPositions": ["Winger"],
      "foot": "right",
      "heightCm": 180,
      "weightKg": 75,
      "profilePhotoUrl": "https://cloudinary.com/...",
      "videoUrls": [...],
      "createdAt": "2026-02-01T00:00:00Z"
    },
    ...
  ],
  "pagination": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  },
  "filters": {}
}
```

---

### Étape 3: Recherche par position

```bash
# Rechercher des Strikers
curl -X GET "http://localhost:5000/api/players/search?position=Striker" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Rechercher des Goalkeepers
curl -X GET "http://localhost:5000/api/players/search?position=Goalkeeper" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Rechercher des Central Midfielders
curl -X GET "http://localhost:5000/api/players/search?position=Central%20Midfielder" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Note:** Les espaces dans l'URL doivent être encodés (%20)

---

### Étape 4: Recherche par pays

```bash
# Joueurs de France
curl -X GET "http://localhost:5000/api/players/search?country=France" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Joueurs d'Espagne (case-insensitive)
curl -X GET "http://localhost:5000/api/players/search?country=spain" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Joueurs du Brésil
curl -X GET "http://localhost:5000/api/players/search?country=Brazil" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Étape 5: Recherche par tranche d'âge

```bash
# Jeunes joueurs (18-22 ans)
curl -X GET "http://localhost:5000/api/players/search?ageMin=18&ageMax=22" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Joueurs expérimentés (28-35 ans)
curl -X GET "http://localhost:5000/api/players/search?ageMin=28&ageMax=35" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Joueurs de moins de 20 ans
curl -X GET "http://localhost:5000/api/players/search?ageMax=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Joueurs de plus de 30 ans
curl -X GET "http://localhost:5000/api/players/search?ageMin=30" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Étape 6: Recherche combinée (filtres multiples)

```bash
# Strikers français entre 20 et 25 ans
curl -X GET "http://localhost:5000/api/players/search?position=Striker&country=France&ageMin=20&ageMax=25" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Goalkeepers expérimentés (30-40 ans)
curl -X GET "http://localhost:5000/api/players/search?position=Goalkeeper&ageMin=30&ageMax=40" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Central Midfielders jeunes d'Espagne
curl -X GET "http://localhost:5000/api/players/search?position=Central%20Midfielder&country=Spain&ageMax=23" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Étape 7: Pagination

```bash
# Page 1 (20 résultats par défaut)
curl -X GET "http://localhost:5000/api/players/search?position=Striker" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Page 2
curl -X GET "http://localhost:5000/api/players/search?position=Striker&page=2" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Page 1 avec 50 résultats
curl -X GET "http://localhost:5000/api/players/search?position=Striker&limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Page 3 avec 10 résultats
curl -X GET "http://localhost:5000/api/players/search?position=Striker&page=3&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Étape 8: Tri des résultats

```bash
# Plus récents en premier (défaut)
curl -X GET "http://localhost:5000/api/players/search" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Plus anciens en premier
curl -X GET "http://localhost:5000/api/players/search?sortBy=createdAt&sortOrder=asc" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Plus jeunes en premier
curl -X GET "http://localhost:5000/api/players/search?sortBy=age&sortOrder=asc" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Plus âgés en premier
curl -X GET "http://localhost:5000/api/players/search?sortBy=age&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Tests d'Erreur

### Erreur 1: Recruteur non approuvé (pending)

**Prérequis:** Se connecter avec un recruteur status='pending'

```bash
curl -X GET "http://localhost:5000/api/players/search" \
  -H "Authorization: Bearer PENDING_RECRUITER_TOKEN"
```

**Réponse attendue (403):**
```json
{
  "error": "Votre compte recruteur est en attente de validation",
  "code": "RECRUITER_NOT_APPROVED",
  "status": "pending"
}
```

---

### Erreur 2: Non authentifié

```bash
curl -X GET "http://localhost:5000/api/players/search"
```

**Réponse attendue (401):**
```json
{
  "error": "Token d'authentification manquant",
  "code": "AUTH_TOKEN_MISSING"
}
```

---

### Erreur 3: Utilisateur joueur (pas recruteur)

**Prérequis:** Se connecter avec un compte player

```bash
curl -X GET "http://localhost:5000/api/players/search" \
  -H "Authorization: Bearer PLAYER_TOKEN"
```

**Réponse attendue (403):**
```json
{
  "error": "Accès réservé aux recruteurs",
  "code": "AUTH_FORBIDDEN_RECRUITER_ONLY"
}
```

---

### Erreur 4: Position invalide

```bash
curl -X GET "http://localhost:5000/api/players/search?position=InvalidPosition" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse attendue (400):**
```json
{
  "error": "Données invalides",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "position",
      "message": "Position invalide"
    }
  ]
}
```

---

### Erreur 5: Âge min > Âge max

```bash
curl -X GET "http://localhost:5000/api/players/search?ageMin=30&ageMax=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse attendue (400):**
```json
{
  "error": "Données invalides",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "ageMin",
      "message": "L'âge minimum doit être inférieur ou égal à l'âge maximum"
    }
  ]
}
```

---

### Erreur 6: Âge hors limites

```bash
# Âge min trop bas
curl -X GET "http://localhost:5000/api/players/search?ageMin=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Âge max trop haut
curl -X GET "http://localhost:5000/api/players/search?ageMax=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse attendue (400):**
```json
{
  "error": "Données invalides",
  "code": "VALIDATION_ERROR",
  "details": [...]
}
```

---

## Positions Valides (14 positions)

```
Défenseurs:
- Goalkeeper
- Center Back
- Left Back
- Right Back
- Wing Back

Milieux:
- Defensive Midfielder
- Central Midfielder
- Attacking Midfielder
- Left Midfielder
- Right Midfielder
- Winger

Attaquants:
- Striker
- Forward
- Second Striker
```

---

## PowerShell (Windows)

### Recherche simple

```powershell
$token = "YOUR_APPROVED_RECRUITER_TOKEN"

Invoke-RestMethod -Uri "http://localhost:5000/api/players/search" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
  }
```

### Recherche par position

```powershell
$token = "YOUR_TOKEN"
$position = "Striker"

Invoke-RestMethod -Uri "http://localhost:5000/api/players/search?position=$position" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
  }
```

### Recherche combinée

```powershell
$token = "YOUR_TOKEN"
$params = @{
    position = "Striker"
    country = "France"
    ageMin = 20
    ageMax = 25
    page = 1
    limit = 20
}

$queryString = ($params.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "&"

Invoke-RestMethod -Uri "http://localhost:5000/api/players/search?$queryString" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
  }
```

---

## Checklist de Test

### Tests Fonctionnels

- [ ] Recherche sans filtres (tous joueurs actifs)
- [ ] Recherche par position (primary position)
- [ ] Recherche par position (secondary position)
- [ ] Recherche par pays (case-insensitive)
- [ ] Recherche par âge (ageMin seulement)
- [ ] Recherche par âge (ageMax seulement)
- [ ] Recherche par âge (ageMin + ageMax)
- [ ] Recherche combinée (position + pays + âge)
- [ ] Pagination page 1
- [ ] Pagination page 2+
- [ ] Limit personnalisé (10, 50, 100)
- [ ] Tri par createdAt (asc)
- [ ] Tri par createdAt (desc)
- [ ] Tri par age (asc - plus jeunes d'abord)
- [ ] Tri par age (desc - plus âgés d'abord)
- [ ] Seulement joueurs actifs retournés

### Tests d'Erreur

- [ ] Sans authentification (401)
- [ ] Recruteur pending (403)
- [ ] Joueur (pas recruteur) (403)
- [ ] Position invalide (400)
- [ ] ageMin > ageMax (400)
- [ ] ageMin < 13 (400)
- [ ] ageMax > 45 (400)
- [ ] Limit > 100 (capped à 100)
- [ ] Page < 1 (capped à 1)

### Tests de Sécurité

- [ ] Email joueur pas exposé dans résultats
- [ ] Joueurs suspendus pas retournés
- [ ] Recruteur rejected ne peut pas rechercher
- [ ] Recruteur suspended ne peut pas rechercher

---

## Cas d'Usage Réels

### 1. Recruteur cherche jeune attaquant français

```bash
curl -X GET "http://localhost:5000/api/players/search?position=Striker&country=France&ageMax=23&sortBy=age&sortOrder=asc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Résultat attendu:** Strikers français de 23 ans ou moins, du plus jeune au plus âgé

---

### 2. Recruteur cherche gardien expérimenté

```bash
curl -X GET "http://localhost:5000/api/players/search?position=Goalkeeper&ageMin=30&ageMax=38" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Résultat attendu:** Gardiens entre 30 et 38 ans

---

### 3. Scout cherche nouveaux profils

```bash
curl -X GET "http://localhost:5000/api/players/search?sortBy=createdAt&sortOrder=desc&limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Résultat attendu:** 50 profils les plus récemment créés

---

## Performance

**Objectif:** Temps de réponse < 3 secondes

**Test:**
```bash
time curl -X GET "http://localhost:5000/api/players/search?position=Striker&country=France" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Vérifier:**
- Temps total < 3s
- Pagination efficace
- Index base de données utilisés

---

## Prochaines Étapes

Après SPEC-MVP-009:

1. **SPEC-MVP-010:** Interface frontend recherche
   - Formulaire avec filtres
   - Affichage résultats en grille
   - Bouton "Voir profil"

2. **Tests Automatisés:**
   - Tests unitaires (player.service.spec.ts)
   - Tests d'intégration (player.routes.spec.ts)
   - Coverage search functionality

3. **Optimisations V1:**
   - Full-text search (nom, bio)
   - Filtres avancés (pied, taille, poids)
   - Recherche géographique (rayon)

---

**Dernière mise à jour:** 2026-02-03
**Statut:** Prêt pour test manuel
