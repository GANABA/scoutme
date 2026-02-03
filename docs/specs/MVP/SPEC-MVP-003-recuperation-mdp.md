# SPEC-MVP-003: Récupération Mot de Passe

**Phase:** MVP
**Sprint:** 1
**Domaine:** Authentication
**Priorité:** Moyenne
**Dépendances:** SPEC-MVP-001, SPEC-MVP-002

---

## Description

Flux de réinitialisation de mot de passe par email sécurisé. Permet aux utilisateurs de récupérer l'accès à leur compte en cas d'oubli du mot de passe via un token unique à durée limitée envoyé par email.

---

## Requirements

### REQ-PWD-001: Reset Token Generation
The system SHALL generate unique reset token on password reset request.

### REQ-PWD-002: Email Notification
The system MUST send reset email with token link via Resend API.

### REQ-PWD-003: Token Expiration
The system SHALL expire reset token after 1 hour from generation.

### REQ-PWD-004: Password Strength Validation
The system MUST validate new password strength (minimum 8 characters, uppercase, lowercase, number).

### REQ-PWD-005: Session Invalidation
The system SHALL invalidate all user sessions on successful password change.

### REQ-PWD-006: Rate Limiting
The system MUST rate limit reset requests to maximum 3 attempts per hour per email.

---

## Endpoints API

### POST /api/auth/forgot-password
**Description:** Demander la réinitialisation du mot de passe

**Request Body:**
```json
{
  "email": "string (required)"
}
```

**Response 200 OK:**
```json
{
  "message": "Si cet email existe, vous recevrez un lien de réinitialisation",
  "email": "user@example.com"
}
```

**Note:** Retourner toujours succès même si l'email n'existe pas (sécurité - éviter énumération des emails)

**Response 429 Too Many Requests:**
```json
{
  "error": "Trop de demandes. Veuillez réessayer dans 1 heure",
  "code": "AUTH_RATE_LIMIT_EXCEEDED",
  "retryAfter": 3600
}
```

---

### POST /api/auth/reset-password
**Description:** Réinitialiser le mot de passe avec le token

**Request Body:**
```json
{
  "token": "string (required)",
  "newPassword": "string (required, min 8 chars)"
}
```

**Response 200 OK:**
```json
{
  "message": "Mot de passe réinitialisé avec succès"
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Token de réinitialisation invalide ou expiré",
  "code": "AUTH_INVALID_RESET_TOKEN"
}
```

**Response 400 Bad Request (weak password):**
```json
{
  "error": "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre",
  "code": "AUTH_WEAK_PASSWORD"
}
```

---

## Schéma Base de Données

### Modifications au modèle User

```prisma
model User {
  id                     String    @id @default(uuid()) @db.Uuid
  email                  String    @unique @db.VarChar(255)
  passwordHash           String    @map("password_hash") @db.VarChar(255)
  userType               UserType  @map("user_type")
  emailVerified          Boolean   @default(false) @map("email_verified")

  // Email verification (SPEC-MVP-002)
  verificationToken         String?   @unique @map("verification_token") @db.VarChar(255)
  verificationTokenExpires  DateTime? @map("verification_token_expires")

  // Password reset (SPEC-MVP-003)
  resetToken                String?   @unique @map("reset_token") @db.VarChar(255)
  resetTokenExpires         DateTime? @map("reset_token_expires")
  resetRequestCount         Int       @default(0) @map("reset_request_count")
  lastResetRequest          DateTime? @map("last_reset_request")

  createdAt              DateTime  @default(now()) @map("created_at")
  updatedAt              DateTime  @updatedAt @map("updated_at")

  player    Player?
  recruiter Recruiter?

  @@index([resetToken])
  @@map("users")
}
```

**Migration à créer:**
```bash
npx prisma migrate dev --name add_password_reset
```

---

## Configuration Email

### Variables d'environnement
Utilise la même configuration Resend que SPEC-MVP-002

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@scoutme.com
```

---

## Template Email

### Fichier: `backend/src/templates/password-reset-fr.html`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation Mot de Passe - ScoutMe</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
      background: #ef4444;
      color: white;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background: #dc2626;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 14px;
    }
    .warning {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔒 Réinitialisation de Mot de Passe</h1>
  </div>
  <div class="content">
    <h2>Demande de réinitialisation</h2>
    <p>Bonjour,</p>
    <p>Vous avez demandé à réinitialiser votre mot de passe ScoutMe.</p>
    <p>Pour créer un nouveau mot de passe, cliquez sur le bouton ci-dessous :</p>

    <div style="text-align: center;">
      <a href="{{resetUrl}}" class="button">Réinitialiser mon mot de passe</a>
    </div>

    <p>Ou copiez ce lien dans votre navigateur :</p>
    <div style="background: white; border: 2px dashed #d1d5db; padding: 15px; border-radius: 6px; word-break: break-all;">
      {{resetUrl}}
    </div>

    <div class="warning">
      <strong>⚠️ Important :</strong>
      <ul style="margin: 10px 0 0 0;">
        <li>Ce lien expire dans <strong>1 heure</strong></li>
        <li>Après utilisation, ce lien devient invalide</li>
        <li>Ne partagez jamais ce lien avec personne</li>
      </ul>
    </div>

    <p><strong>Vous n'avez pas demandé cette réinitialisation ?</strong><br>
    Ignorez cet email. Votre mot de passe actuel reste inchangé.</p>
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

### Génération du Token Reset

```typescript
import crypto from 'crypto';

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function calculateResetTokenExpiry(): Date {
  return new Date(Date.now() + 60 * 60 * 1000); // 1 heure
}
```

### Demande de Réinitialisation

```typescript
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  // Important: Ne pas révéler si l'email existe ou non (sécurité)
  if (!user) {
    return { success: true }; // Réponse identique
  }

  // Vérifier rate limiting
  const canReset = await canRequestPasswordReset(user);
  if (!canReset) {
    throw new Error('AUTH_RATE_LIMIT_EXCEEDED');
  }

  // Générer nouveau token
  const resetToken = generateResetToken();
  const resetTokenExpires = calculateResetTokenExpiry();

  // Mettre à jour l'utilisateur
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpires,
      resetRequestCount: {
        increment: 1
      },
      lastResetRequest: new Date()
    }
  });

  // Envoyer email
  await sendPasswordResetEmail(user.email, resetToken);

  return { success: true };
}
```

### Rate Limiting

```typescript
export async function canRequestPasswordReset(user: User): Promise<boolean> {
  // Si 3 demandes ou plus
  if (user.resetRequestCount >= 3) {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Vérifier si la dernière demande était il y a moins d'1 heure
    if (user.lastResetRequest && user.lastResetRequest > hourAgo) {
      return false; // Rate limit actif
    }

    // Réinitialiser le compteur après 1 heure
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetRequestCount: 0
      }
    });
  }

  return true;
}
```

### Réinitialisation du Mot de Passe

```typescript
export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findUnique({
    where: { resetToken: token }
  });

  if (!user) {
    throw new Error('AUTH_INVALID_RESET_TOKEN');
  }

  // Vérifier expiration
  if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
    throw new Error('AUTH_RESET_TOKEN_EXPIRED');
  }

  // Valider force du nouveau mot de passe
  validatePasswordStrength(newPassword);

  // Hasher le nouveau mot de passe
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Mettre à jour l'utilisateur
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
      resetRequestCount: 0,
      lastResetRequest: null
    }
  });

  // TODO: Invalider toutes les sessions actives (refresh tokens)
  // Cette fonctionnalité nécessite un système de gestion de refresh tokens
  // qui sera implémenté dans une évolution future

  return { success: true };
}
```

---

## Validation des Données

### Schéma Zod: Forgot Password

```typescript
import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Format email invalide')
    .toLowerCase()
    .trim()
});
```

### Schéma Zod: Reset Password

```typescript
export const resetPasswordSchema = z.object({
  token: z.string()
    .min(64, 'Token invalide')
    .max(64, 'Token invalide'),
  newPassword: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
});
```

---

## Structure du Code

### Fichiers à créer/modifier

```
backend/src/
├── services/
│   ├── auth.service.ts             # Ajouter logique reset password
│   └── email.service.ts            # Ajouter sendPasswordResetEmail()
├── controllers/
│   └── auth.controller.ts          # Ajouter handlers forgot/reset
├── routes/
│   └── auth.routes.ts              # Ajouter routes forgot/reset
├── templates/
│   └── password-reset-fr.html      # Template email
└── validators/
    └── auth.validator.ts           # Ajouter schémas Zod
```

---

## Sécurité

### Protection du Token
- Token unique de 64 caractères hexadécimal (256 bits)
- Stocké en base de données avec index unique
- Expiration stricte à 1 heure
- Token à usage unique (supprimé après utilisation)

### Rate Limiting
- Maximum 3 demandes de reset par heure par email
- Reset automatique du compteur après 1 heure
- Protection contre brute-force et spam

### Prévention Énumération Email
- Réponse identique que l'email existe ou non
- Message générique: "Si cet email existe, vous recevrez un lien"
- Empêche un attaquant de lister les emails enregistrés

### Invalidation Sessions
- **MVP:** Changement de mot de passe seul
- **V1+:** Invalider tous les refresh tokens actifs de l'utilisateur
- Nécessite système de tracking des refresh tokens (table dédiée)

---

## Tests à Implémenter

### Tests Unitaires

**auth.service.spec.ts:**
- ✅ Request password reset with valid email (should generate token and send email)
- ✅ Request password reset with non-existent email (should succeed silently)
- ✅ Request password reset rate limiting (should block after 3 attempts)
- ✅ Reset password with valid token (should update password)
- ✅ Reset password with expired token (should fail)
- ✅ Reset password with invalid token (should fail)
- ✅ Reset password with weak password (should fail validation)

### Tests d'Intégration

**auth.routes.spec.ts:**
- ✅ POST /api/auth/forgot-password - Valid email
- ✅ POST /api/auth/forgot-password - Non-existent email (same response)
- ✅ POST /api/auth/forgot-password - Rate limit exceeded
- ✅ POST /api/auth/reset-password - Valid token and password
- ✅ POST /api/auth/reset-password - Expired token
- ✅ POST /api/auth/reset-password - Weak password

---

## Workflow Utilisateur

### Flux Complet

1. **Utilisateur clique "Mot de passe oublié"** sur page login
2. **Frontend affiche** formulaire avec champ email
3. **Utilisateur saisit** son email → POST /api/auth/forgot-password
4. **Backend génère** token et envoie email
5. **Frontend affiche** message "Vérifiez vos emails"
6. **Utilisateur reçoit** email avec lien de reset
7. **Utilisateur clique** sur le lien → redirige vers page reset
8. **Frontend affiche** formulaire nouveau mot de passe
9. **Utilisateur saisit** nouveau password → POST /api/auth/reset-password
10. **Backend valide** token et met à jour mot de passe
11. **Frontend redirige** vers login avec message de succès

---

## Critères d'Acceptation

- [ ] Un utilisateur peut demander un reset de mot de passe via email
- [ ] Un email avec lien de réinitialisation est envoyé (template professionnel)
- [ ] Le lien expire après 1 heure
- [ ] Le token est à usage unique (invalidé après utilisation)
- [ ] Le nouveau mot de passe est validé (force minimum)
- [ ] Rate limiting actif (max 3 demandes/heure)
- [ ] Réponse identique que l'email existe ou non (sécurité)
- [ ] Template email responsive et professionnel
- [ ] Tous les tests passent

---

## Notes d'Implémentation

### Frontend (Next.js)

**Pages à créer:**
- `/auth/forgot-password` - Formulaire demande reset
- `/auth/reset-password?token=xxx` - Formulaire nouveau password

**Composants:**
```typescript
// app/auth/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (response.ok) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="success-message">
        <h2>Email envoyé</h2>
        <p>Si cet email existe, vous recevrez un lien de réinitialisation.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Votre email"
        required
      />
      <button type="submit">Réinitialiser mon mot de passe</button>
    </form>
  );
}
```

---

**Statut:** ✅ Spécification complète et prête pour implémentation
**Créé le:** 2026-02-02
**Dernière mise à jour:** 2026-02-02
