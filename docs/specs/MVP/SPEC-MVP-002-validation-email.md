# SPEC-MVP-002: Validation Email Double Opt-In

**Phase:** MVP
**Sprint:** 1
**Domaine:** Authentication
**Priorité:** Haute
**Dépendances:** SPEC-MVP-001

---

## Description

Système de validation email par double opt-in pour confirmer l'adresse email lors de l'inscription. Utilise Resend API pour l'envoi d'emails avec token unique à durée limitée.

---

## Requirements

### REQ-EMAIL-001: Token Generation
The system SHALL generate unique verification token on user registration.

### REQ-EMAIL-002: Email Sending
The system MUST send verification email via Resend API immediately after registration.

### REQ-EMAIL-003: Token Expiration
The system SHALL expire verification token after 24 hours from generation.

### REQ-EMAIL-004: Account Verification
The system MUST mark user as verified after successful token validation.

### REQ-EMAIL-005: Login Prevention
The system SHALL prevent login if email is not verified.

### REQ-EMAIL-006: Resend Rate Limiting
The system SHALL allow resend verification email with maximum 3 attempts per hour.

---

## Endpoints API

### GET /api/auth/verify-email?token={token}
**Description:** Valider l'email utilisateur avec le token reçu par email

**Query Parameters:**
- `token`: string (required) - Token de vérification unique

**Response 200 OK:**
```json
{
  "message": "Email vérifié avec succès",
  "email": "user@example.com"
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Token de vérification invalide ou expiré",
  "code": "AUTH_INVALID_VERIFICATION_TOKEN"
}
```

**Response 404 Not Found:**
```json
{
  "error": "Utilisateur introuvable",
  "code": "AUTH_USER_NOT_FOUND"
}
```

---

### POST /api/auth/resend-verification
**Description:** Renvoyer un email de vérification

**Request Body:**
```json
{
  "email": "string (required)"
}
```

**Response 200 OK:**
```json
{
  "message": "Email de vérification renvoyé",
  "email": "user@example.com"
}
```

**Response 429 Too Many Requests:**
```json
{
  "error": "Trop de demandes. Veuillez réessayer dans 1 heure",
  "code": "AUTH_RATE_LIMIT_EXCEEDED",
  "retryAfter": 3600
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Email déjà vérifié",
  "code": "AUTH_EMAIL_ALREADY_VERIFIED"
}
```

---

## Schéma Base de Données

### Modifications à apporter au modèle User

```prisma
model User {
  id                        String    @id @default(uuid()) @db.Uuid
  email                     String    @unique @db.VarChar(255)
  passwordHash              String    @map("password_hash") @db.VarChar(255)
  userType                  UserType  @map("user_type")
  emailVerified             Boolean   @default(false) @map("email_verified")
  verificationToken         String?   @unique @map("verification_token") @db.VarChar(255)
  verificationTokenExpires  DateTime? @map("verification_token_expires")
  verificationEmailCount    Int       @default(0) @map("verification_email_count")
  lastVerificationEmailSent DateTime? @map("last_verification_email_sent")
  createdAt                 DateTime  @default(now()) @map("created_at")
  updatedAt                 DateTime  @updatedAt @map("updated_at")

  player    Player?
  recruiter Recruiter?

  @@index([verificationToken])
  @@map("users")
}
```

**Migration à créer:**
```bash
npx prisma migrate dev --name add_email_verification
```

---

## Configuration Resend

### Variables d'environnement

```env
# Resend API
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@scoutme.com
RESEND_FROM_NAME=ScoutMe
```

### Installation

```bash
npm install resend
```

---

## Template Email

### Fichier: `backend/src/templates/verification-email-fr.html`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vérification Email - ScoutMe</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background: #5568d3;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 14px;
    }
    .token-box {
      background: white;
      border: 2px dashed #d1d5db;
      padding: 15px;
      margin: 20px 0;
      border-radius: 6px;
      text-align: center;
      font-family: monospace;
      font-size: 18px;
      letter-spacing: 2px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚽ Bienvenue sur ScoutMe</h1>
  </div>
  <div class="content">
    <h2>Vérifiez votre adresse email</h2>
    <p>Bonjour,</p>
    <p>Merci de vous être inscrit sur ScoutMe, la plateforme qui connecte les talents du football avec les recruteurs professionnels.</p>
    <p>Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>

    <div style="text-align: center;">
      <a href="{{verificationUrl}}" class="button">Vérifier mon email</a>
    </div>

    <p>Ou copiez ce lien dans votre navigateur :</p>
    <div class="token-box">
      {{verificationUrl}}
    </div>

    <p><strong>⚠️ Important :</strong> Ce lien expire dans <strong>24 heures</strong>.</p>

    <p>Si vous n'avez pas créé de compte sur ScoutMe, ignorez cet email.</p>
  </div>
  <div class="footer">
    <p>ScoutMe - Connecte ton talent au monde du football</p>
    <p>© 2026 ScoutMe. Tous droits réservés.</p>
  </div>
</body>
</html>
```

---

## Logique Métier

### Génération du Token

```typescript
import crypto from 'crypto';

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function calculateTokenExpiry(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures
}
```

### Validation du Token

```typescript
export async function verifyEmail(token: string) {
  const user = await prisma.user.findUnique({
    where: { verificationToken: token }
  });

  if (!user) {
    throw new Error('AUTH_INVALID_VERIFICATION_TOKEN');
  }

  if (user.emailVerified) {
    throw new Error('AUTH_EMAIL_ALREADY_VERIFIED');
  }

  if (user.verificationTokenExpires! < new Date()) {
    throw new Error('AUTH_VERIFICATION_TOKEN_EXPIRED');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null
    }
  });

  return user;
}
```

### Rate Limiting Resend

```typescript
export async function canResendVerificationEmail(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) return false;

  // Vérifier si déjà vérifié
  if (user.emailVerified) return false;

  // Vérifier le compteur et la date du dernier envoi
  if (user.verificationEmailCount >= 3) {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (user.lastVerificationEmailSent && user.lastVerificationEmailSent > hourAgo) {
      return false; // Rate limit dépassé
    }
    // Réinitialiser le compteur après 1 heure
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationEmailCount: 0
      }
    });
  }

  return true;
}
```

---

## Structure du Code

### Fichiers à créer/modifier

```
backend/src/
├── services/
│   ├── auth.service.ts             # Ajouter logique vérification
│   └── email.service.ts            # Nouveau: Service Resend
├── controllers/
│   └── auth.controller.ts          # Ajouter handlers verify/resend
├── routes/
│   └── auth.routes.ts              # Ajouter routes verify/resend
├── templates/
│   └── verification-email-fr.html  # Template email
└── utils/
    └── token.utils.ts              # Fonctions génération token
```

---

## Sécurité

### Protection du Token
- Token unique de 64 caractères hexadécimal (256 bits)
- Stocké en base de données (pas de JWT pour éviter tampering)
- Index unique sur `verificationToken` pour recherche rapide
- Expiration stricte à 24 heures

### Rate Limiting
- Maximum 3 emails de vérification par heure par compte
- Reset du compteur après 1 heure
- Tracking via `verificationEmailCount` et `lastVerificationEmailSent`

### Validation Serveur
- Vérifier que le token existe et n'a pas expiré
- Vérifier que l'email n'est pas déjà vérifié
- Valider format email avant resend

---

## Tests à Implémenter

### Tests Unitaires

**email.service.spec.ts:**
- ✅ Generate verification token (should return 64 char hex string)
- ✅ Calculate token expiry (should be 24 hours from now)
- ✅ Send verification email (should call Resend API)
- ✅ Verify email with valid token (should mark user as verified)
- ✅ Verify email with expired token (should fail)
- ✅ Verify email with invalid token (should fail)
- ✅ Resend verification email (should update token and send email)
- ✅ Resend rate limiting (should block after 3 attempts within 1 hour)

### Tests d'Intégration

**auth.routes.spec.ts:**
- ✅ GET /api/auth/verify-email - Valid token
- ✅ GET /api/auth/verify-email - Expired token
- ✅ GET /api/auth/verify-email - Invalid token
- ✅ POST /api/auth/resend-verification - Success
- ✅ POST /api/auth/resend-verification - Already verified
- ✅ POST /api/auth/resend-verification - Rate limit exceeded

---

## Workflow Utilisateur

### Inscription Complète

1. **Utilisateur s'inscrit** → POST /api/auth/register
2. **Système génère token** et l'enregistre dans la base
3. **Email envoyé** avec lien de vérification
4. **Utilisateur clique** sur le lien (ou copie URL)
5. **Frontend redirige** vers GET /api/auth/verify-email?token=xxx
6. **Backend valide** le token et marque `emailVerified = true`
7. **Frontend affiche** message de succès et redirige vers login

### Cas Resend

1. **Utilisateur ne reçoit pas l'email** (spam, erreur, etc.)
2. **Frontend affiche** bouton "Renvoyer l'email"
3. **Utilisateur clique** → POST /api/auth/resend-verification
4. **Système génère nouveau token** (invalide l'ancien)
5. **Nouvel email envoyé**

---

## Critères d'Acceptation

- [ ] À l'inscription, un token de vérification est généré et un email est envoyé
- [ ] L'email contient un lien cliquable valide pendant 24h
- [ ] Le clic sur le lien vérifie l'email et redirige vers une page de succès
- [ ] Les utilisateurs non vérifiés ne peuvent pas se connecter
- [ ] L'utilisateur peut demander un renvoi d'email (max 3 fois/heure)
- [ ] Le token expire après 24h et devient inutilisable
- [ ] Les emails sont envoyés via Resend avec succès
- [ ] Template email professionnel et responsive
- [ ] Tous les tests passent

---

## Notes d'Implémentation

### Intégration avec SPEC-MVP-001

Dans `auth.service.ts`, modifier la fonction `register()` :

```typescript
export async function register(data: RegisterInput) {
  // ... (logique existante)

  // Générer token de vérification
  const verificationToken = generateVerificationToken();
  const verificationTokenExpires = calculateTokenExpiry();

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash: hashedPassword,
      userType: data.userType,
      verificationToken,
      verificationTokenExpires,
      emailVerified: false
    }
  });

  // Envoyer email de vérification
  await sendVerificationEmail(user.email, verificationToken);

  return user;
}
```

Dans `auth.controller.ts`, modifier le handler `login()` :

```typescript
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  // Vérifier si l'email est vérifié
  if (!user?.emailVerified) {
    return res.status(401).json({
      error: 'Veuillez vérifier votre email avant de vous connecter',
      code: 'AUTH_EMAIL_NOT_VERIFIED'
    });
  }

  // ... (suite de la logique login)
}
```

---

**Statut:** ✅ Spécification complète et prête pour implémentation
**Créé le:** 2026-02-02
**Dernière mise à jour:** 2026-02-02
