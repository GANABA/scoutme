# SPEC-MVP-001: Authentification Utilisateur de Base

**Phase:** MVP
**Sprint:** 1
**Domaine:** Authentication
**Priorité:** Critique
**Dépendances:** Aucune

---

## Description

Système d'authentification JWT permettant l'inscription, la connexion, et la gestion des sessions pour les 3 types d'utilisateurs (player, recruiter, admin).

---

## Requirements

### REQ-AUTH-001: Email/Password Registration
The system SHALL support email/password registration with user_type selection.

### REQ-AUTH-002: Password Hashing
The system MUST hash passwords using bcrypt with minimum 10 rounds.

### REQ-AUTH-003: Email Validation
The system SHALL validate email format and ensure uniqueness before account creation.

### REQ-AUTH-004: JWT Access Token
The system MUST generate JWT access token with 15 minutes expiry time.

### REQ-AUTH-005: JWT Refresh Token
The system MUST generate JWT refresh token with 7 days expiry time.

### REQ-AUTH-006: Secure Cookie Storage
The system SHALL store refresh token in HTTP-only secure cookie.

### REQ-AUTH-007: User Type Validation
The system MUST validate user_type during registration (player/recruiter/admin).

### REQ-AUTH-008: Duplicate Prevention
The system SHALL prevent duplicate email registration with clear error message.

---

## Endpoints API

### POST /api/auth/register
**Description:** Créer un nouveau compte utilisateur

**Request Body:**
```json
{
  "email": "string (required, valid email format)",
  "password": "string (required, min 8 chars)",
  "userType": "player | recruiter | admin (required)"
}
```

**Response 201 Created:**
```json
{
  "message": "Compte créé avec succès",
  "userId": "uuid",
  "email": "string"
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Email déjà utilisé",
  "code": "AUTH_EMAIL_DUPLICATE"
}
```

---

### POST /api/auth/login
**Description:** Connexion utilisateur et génération des tokens

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response 200 OK:**
```json
{
  "accessToken": "jwt_string",
  "user": {
    "id": "uuid",
    "email": "string",
    "userType": "player | recruiter | admin"
  }
}
```

**Cookie Set:**
- `refreshToken`: HTTP-only, Secure, SameSite=Strict, Max-Age=7 days

**Response 401 Unauthorized:**
```json
{
  "error": "Email ou mot de passe incorrect",
  "code": "AUTH_INVALID_CREDENTIALS"
}
```

---

### POST /api/auth/logout
**Description:** Déconnexion utilisateur et invalidation du refresh token

**Headers:**
```
Authorization: Bearer <access_token>
Cookie: refreshToken=<refresh_token>
```

**Response 200 OK:**
```json
{
  "message": "Déconnexion réussie"
}
```

---

### POST /api/auth/refresh
**Description:** Générer un nouveau access token avec le refresh token

**Cookie Required:**
- `refreshToken`: JWT refresh token

**Response 200 OK:**
```json
{
  "accessToken": "new_jwt_string"
}
```

**Response 401 Unauthorized:**
```json
{
  "error": "Refresh token invalide ou expiré",
  "code": "AUTH_INVALID_REFRESH_TOKEN"
}
```

---

## Schéma Base de Données

### Table: users

```prisma
model User {
  id           String   @id @default(uuid()) @db.Uuid
  email        String   @unique @db.VarChar(255)
  passwordHash String   @map("password_hash") @db.VarChar(255)
  userType     UserType @map("user_type")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  player    Player?
  recruiter Recruiter?

  @@map("users")
}

enum UserType {
  player
  recruiter
  admin
}
```

**Note:** Ce schéma existe déjà dans `backend/prisma/schema.prisma`

---

## Sécurité

### Rate Limiting
- **Endpoint /api/auth/register:** 5 requêtes par 15 minutes par IP
- **Endpoint /api/auth/login:** 5 requêtes par 15 minutes par IP
- **Endpoint /api/auth/refresh:** 10 requêtes par 15 minutes par IP

### Password Hashing
- Algorithme: `bcrypt`
- Rounds: minimum 10 (recommandé: 12)
- Bibliothèque: `bcryptjs` ou `bcrypt`

### JWT Configuration
**Access Token:**
- Algorithme: HS256
- Expiration: 15 minutes
- Payload: `{ userId, email, userType }`
- Secret: `process.env.JWT_SECRET`

**Refresh Token:**
- Algorithme: HS256
- Expiration: 7 jours
- Payload: `{ userId, tokenVersion }` (optionnel pour invalidation)
- Secret: `process.env.JWT_REFRESH_SECRET`

### Cookie Configuration
```javascript
{
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
}
```

### Protection HTTPS
- Mandatory en production
- Let's Encrypt SSL certificates (Render auto-provisioning)

### CORS Configuration
- Origin whitelist: `process.env.CORS_ORIGIN`
- Credentials: `true` (pour accepter cookies)

---

## Validation des Données

### Schéma Zod: Registration

```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string()
    .email('Format email invalide')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  userType: z.enum(['player', 'recruiter', 'admin'])
});
```

### Schéma Zod: Login

```typescript
export const loginSchema = z.object({
  email: z.string()
    .email('Format email invalide')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Mot de passe requis')
});
```

---

## Structure du Code

### Fichiers à créer/modifier

```
backend/src/
├── validators/
│   └── auth.validator.ts          # Schémas Zod
├── services/
│   └── auth.service.ts             # Logique métier auth
├── controllers/
│   └── auth.controller.ts          # Handlers requêtes HTTP
├── routes/
│   └── auth.routes.ts              # Définition routes Express
├── middlewares/
│   ├── validateRequest.ts          # Middleware validation Zod
│   └── rateLimiter.ts              # Middleware rate limiting
└── utils/
    ├── jwt.utils.ts                # Fonctions JWT
    └── password.utils.ts           # Fonctions bcrypt
```

---

## Tests à Implémenter

### Tests Unitaires (Jest)

**auth.service.spec.ts:**
- ✅ Register user with valid data
- ✅ Register user with duplicate email (should fail)
- ✅ Register user with invalid email format (should fail)
- ✅ Register user with weak password (should fail)
- ✅ Login with valid credentials (should return tokens)
- ✅ Login with invalid credentials (should fail)
- ✅ Refresh token with valid refresh token (should return new access token)
- ✅ Refresh token with expired token (should fail)

### Tests d'Intégration (Supertest)

**auth.routes.spec.ts:**
- ✅ POST /api/auth/register - Success case
- ✅ POST /api/auth/register - Duplicate email
- ✅ POST /api/auth/login - Success case
- ✅ POST /api/auth/login - Invalid credentials
- ✅ POST /api/auth/logout - Success case
- ✅ POST /api/auth/refresh - Success case
- ✅ Rate limiting on registration (should block after 5 attempts)

---

## Variables d'Environnement Requises

```env
# JWT Secrets (générer avec: openssl rand -base64 64)
JWT_SECRET=<secret_key_64_chars>
JWT_REFRESH_SECRET=<secret_key_64_chars>

# CORS
CORS_ORIGIN=http://localhost:3000

# Node Environment
NODE_ENV=development
```

---

## Critères d'Acceptation

- [ ] Un utilisateur peut s'inscrire avec email/password et choisir son type
- [ ] Le mot de passe est hashé avec bcrypt (10+ rounds)
- [ ] L'email est validé et les doublons sont rejetés
- [ ] La connexion génère un access token (15min) et un refresh token (7j)
- [ ] Le refresh token est stocké dans un cookie HTTP-only
- [ ] Le refresh token permet de générer un nouvel access token
- [ ] La déconnexion supprime le refresh token cookie
- [ ] Rate limiting actif sur les endpoints sensibles (5 req/15min)
- [ ] Tous les tests unitaires et d'intégration passent
- [ ] HTTPS obligatoire en production

---

## Notes d'Implémentation

### Ordre d'implémentation recommandé:

1. **Utils:** Créer `jwt.utils.ts` et `password.utils.ts`
2. **Validators:** Créer schémas Zod dans `auth.validator.ts`
3. **Middleware:** Créer `validateRequest.ts` et `rateLimiter.ts`
4. **Service:** Implémenter logique métier dans `auth.service.ts`
5. **Controller:** Créer handlers HTTP dans `auth.controller.ts`
6. **Routes:** Définir routes Express dans `auth.routes.ts`
7. **App:** Intégrer routes dans `app.ts`
8. **Tests:** Écrire tests unitaires et d'intégration
9. **Documentation:** Mettre à jour README backend

### Bibliothèques NPM requises:

```bash
npm install bcryptjs jsonwebtoken cookie-parser express-rate-limit
npm install -D @types/bcryptjs @types/jsonwebtoken @types/cookie-parser
```

---

**Statut:** ✅ Spécification complète et prête pour implémentation
**Créé le:** 2026-02-02
**Dernière mise à jour:** 2026-02-02
