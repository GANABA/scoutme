# Test Manual - API Profil Joueur

## Prérequis
- Backend démarré sur http://localhost:5000
- Base de données PostgreSQL connectée
- Avoir un utilisateur de type 'player' créé et authentifié

## Tests de Base

### 1. Health Check
```bash
curl http://localhost:5000/health
```

**Résultat attendu:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-02T...",
  "environment": "development"
}
```

---

### 2. Créer un Profil Joueur

**Prérequis:** Avoir un token JWT d'un utilisateur de type 'player'

```bash
curl -X POST http://localhost:5000/api/players \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "fullName": "Jean Dupont",
    "birthDate": "2000-05-15",
    "country": "Benin",
    "city": "Cotonou",
    "primaryPosition": "Midfielder",
    "secondaryPositions": ["Winger"],
    "strongFoot": "right",
    "heightCm": 178,
    "weightKg": 75,
    "currentClub": "AS Dragons",
    "phone": "+229 12345678",
    "careerHistory": "Started playing at age 10 in local academy..."
  }'
```

**Résultat attendu (201 Created):**
```json
{
  "message": "Profil joueur créé avec succès",
  "player": {
    "id": "uuid",
    "userId": "uuid",
    "fullName": "Jean Dupont",
    "birthDate": "2000-05-15",
    "age": 25,
    "country": "Benin",
    "city": "Cotonou",
    "primaryPosition": "Midfielder",
    ...
  }
}
```

---

### 3. Récupérer Mon Profil

```bash
curl http://localhost:5000/api/players/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Résultat attendu (200 OK):**
```json
{
  "player": {
    "id": "uuid",
    "fullName": "Jean Dupont",
    ...
  }
}
```

---

### 4. Récupérer un Profil par ID (Public)

```bash
curl http://localhost:5000/api/players/PLAYER_ID
```

**Résultat attendu (200 OK):**
Même structure que ci-dessus

---

### 5. Mettre à Jour un Profil

```bash
curl -X PUT http://localhost:5000/api/players/PLAYER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "currentClub": "AS Dragons Updated",
    "heightCm": 180
  }'
```

**Résultat attendu (200 OK):**
```json
{
  "message": "Profil joueur mis à jour avec succès",
  "player": {
    ...
    "currentClub": "AS Dragons Updated",
    "heightCm": 180
  }
}
```

---

### 6. Supprimer un Profil (Soft Delete)

```bash
curl -X DELETE http://localhost:5000/api/players/PLAYER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Résultat attendu (200 OK):**
```json
{
  "message": "Profil joueur supprimé avec succès"
}
```

---

## Tests d'Erreur

### Créer un profil sans authentification (401)
```bash
curl -X POST http://localhost:5000/api/players \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test",
    "birthDate": "2000-01-01",
    "country": "Benin",
    "primaryPosition": "Striker",
    "phone": "+229 12345678"
  }'
```

**Résultat attendu (401 Unauthorized):**
```json
{
  "error": "Token d'authentification manquant",
  "code": "AUTH_TOKEN_MISSING"
}
```

---

### Créer un profil avec âge invalide (400)
```bash
curl -X POST http://localhost:5000/api/players \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "fullName": "Test",
    "birthDate": "2015-01-01",
    "country": "Benin",
    "primaryPosition": "Striker",
    "phone": "+229 12345678"
  }'
```

**Résultat attendu (400 Bad Request):**
```json
{
  "error": "Données invalides",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "birthDate",
      "message": "Le joueur doit avoir entre 13 et 45 ans"
    }
  ]
}
```

---

### Créer un profil en double (409)
Essayer de créer un deuxième profil avec le même userId

**Résultat attendu (409 Conflict):**
```json
{
  "error": "Un profil joueur existe déjà pour cet utilisateur",
  "code": "PLAYER_PROFILE_EXISTS"
}
```

---

## Workflow Complet de Test

1. **S'inscrire comme joueur** (POST /api/auth/register)
2. **Vérifier l'email** (GET /api/auth/verify-email?token=xxx)
3. **Se connecter** (POST /api/auth/login)
4. **Créer son profil** (POST /api/players)
5. **Récupérer son profil** (GET /api/players/me)
6. **Mettre à jour son profil** (PUT /api/players/:id)
7. **Voir son profil en public** (GET /api/players/:id sans auth)

---

## Prochaines Étapes

- [ ] Implémenter SPEC-MVP-005: Upload photo profil
- [ ] Implémenter SPEC-MVP-006: Gestion vidéos YouTube
- [ ] Écrire tests unitaires pour player.service.ts
- [ ] Écrire tests d'intégration pour player.routes.ts
