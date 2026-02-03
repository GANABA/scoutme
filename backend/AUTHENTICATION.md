# Authentication System - ScoutMe Backend

**Status:** ✅ Implemented (SPEC-MVP-001, SPEC-MVP-002, SPEC-MVP-003)

This document explains how to use the authentication system in the ScoutMe backend.

---

## 🎯 Features Implemented

### SPEC-MVP-001: Basic User Authentication
- ✅ User registration with email/password
- ✅ JWT-based login (access token 15min + refresh token 7 days)
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Refresh token stored in HTTP-only cookie
- ✅ Token refresh mechanism
- ✅ Logout functionality
- ✅ Rate limiting (5 requests/15min for auth endpoints)

### SPEC-MVP-002: Email Verification Double Opt-In
- ✅ Email verification token generation (64 chars, 24h expiry)
- ✅ Verification email sent via Resend
- ✅ Email verification endpoint
- ✅ Resend verification email (max 3/hour)
- ✅ Login blocked until email verified

### SPEC-MVP-003: Password Recovery
- ✅ Password reset request (generates token, sends email)
- ✅ Reset token (64 chars, 1h expiry)
- ✅ Password reset endpoint
- ✅ Rate limiting (max 3 requests/hour)
- ✅ Password strength validation

---

## 🔧 Setup

### 1. Install Dependencies

Already installed:
```bash
npm install
```

### 2. Configure Environment Variables

Update `.env` with your credentials:

```env
# JWT Secrets (generate with: openssl rand -base64 64)
JWT_SECRET=<generate_strong_secret>
JWT_REFRESH_SECRET=<generate_strong_secret>

# Email (Resend)
RESEND_API_KEY=re_your_actual_api_key
RESEND_FROM_EMAIL=noreply@scoutme.com
RESEND_FROM_NAME=ScoutMe

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://postgres:admin@localhost:5432/scoutme_dev"
```

**Generate JWT secrets:**
```bash
# On Linux/Mac
openssl rand -base64 64

# On Windows (PowerShell)
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 3. Run Database Migration

⚠️ **Important:** You need to run the Prisma migration manually in interactive mode:

```bash
cd backend
npx prisma migrate dev --name add_email_verification_and_password_reset
```

This will:
- Update the database schema with authentication fields
- Generate the Prisma Client

### 4. Start the Server

```bash
npm run dev
```

Server runs on `http://localhost:5000`

---

## 📡 API Endpoints

### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "SecurePass123",
  "userType": "player"
}
```

**Response 201:**
```json
{
  "message": "Compte créé avec succès. Veuillez vérifier votre email.",
  "userId": "uuid",
  "email": "player@example.com"
}
```

**Note:** Sends verification email automatically.

---

### 2. Verify Email
```http
GET /api/auth/verify-email?token=<64_char_token>
```

**Response 200:**
```json
{
  "message": "Email vérifié avec succès",
  "email": "player@example.com"
}
```

---

### 3. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "SecurePass123"
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "player@example.com",
    "userType": "player",
    "emailVerified": true
  }
}
```

**Cookie Set:** `refreshToken` (HTTP-only, Secure, SameSite=Strict)

**Error 401 (email not verified):**
```json
{
  "error": "Veuillez vérifier votre email avant de vous connecter",
  "code": "AUTH_EMAIL_NOT_VERIFIED"
}
```

---

### 4. Refresh Access Token
```http
POST /api/auth/refresh
Cookie: refreshToken=<jwt_refresh_token>
```

**Response 200:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 5. Logout
```http
POST /api/auth/logout
```

**Response 200:**
```json
{
  "message": "Déconnexion réussie"
}
```

Clears the `refreshToken` cookie.

---

### 6. Resend Verification Email
```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "player@example.com"
}
```

**Response 200:**
```json
{
  "message": "Si cet email existe, un nouveau lien de vérification a été envoyé",
  "email": "player@example.com"
}
```

**Rate Limit:** Max 3 requests per hour per email.

---

### 7. Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "player@example.com"
}
```

**Response 200:**
```json
{
  "message": "Si cet email existe, vous recevrez un lien de réinitialisation",
  "email": "player@example.com"
}
```

**Note:** Always returns success (security - no email enumeration).

---

### 8. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "<64_char_reset_token>",
  "newPassword": "NewSecurePass123"
}
```

**Response 200:**
```json
{
  "message": "Mot de passe réinitialisé avec succès"
}
```

---

## 🔐 Using Protected Routes

For endpoints that require authentication, include the access token:

```http
GET /api/players/me
Authorization: Bearer <access_token>
```

### Middleware Available

```typescript
import { requireAuth, requirePlayer, requireRecruiter, requireAdmin, requireOwnership } from './middlewares/auth.middleware';

// Require authenticated user
router.get('/protected', requireAuth, handler);

// Require player role
router.get('/player-only', requireAuth, requirePlayer, handler);

// Require recruiter role
router.get('/recruiter-only', requireAuth, requireRecruiter, handler);

// Require admin role
router.get('/admin-only', requireAuth, requireAdmin, handler);

// Require ownership (user can only access their own resources)
router.put('/players/:id', requireAuth, requirePlayer, requireOwnership, handler);
```

Access user info in handlers:
```typescript
function handler(req: Request, res: Response) {
  const { userId, email, userType } = req.user!;
  // ...
}
```

---

## 🧪 Testing

### Manual Testing with cURL

**1. Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","userType":"player"}'
```

**2. Check your email** for verification link (or check console logs in dev)

**3. Verify email:**
```bash
curl "http://localhost:5000/api/auth/verify-email?token=<your_token>"
```

**4. Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}' \
  -c cookies.txt
```

**5. Use access token:**
```bash
ACCESS_TOKEN="<token_from_login>"
curl http://localhost:5000/api/protected-route \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**6. Refresh token:**
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -b cookies.txt
```

### Testing with Postman/Insomnia

1. Create a new environment with:
   - `BASE_URL`: `http://localhost:5000`
   - `ACCESS_TOKEN`: (will be set after login)

2. Import the endpoints above

3. Set up cookie handling for refresh tokens

---

## 📁 File Structure

```
backend/src/
├── controllers/
│   └── auth.controller.ts         # HTTP handlers
├── middlewares/
│   ├── auth.middleware.ts         # Auth protection middlewares
│   ├── rateLimiter.ts             # Rate limiting
│   └── validateRequest.ts         # Zod validation
├── routes/
│   └── auth.routes.ts             # Route definitions
├── services/
│   ├── auth.service.ts            # Business logic
│   └── email.service.ts           # Resend email integration
├── templates/
│   ├── verification-email-fr.html
│   └── password-reset-fr.html
├── utils/
│   ├── jwt.utils.ts               # JWT functions
│   ├── password.utils.ts          # Bcrypt functions
│   └── token.utils.ts             # Token generation
└── validators/
    └── auth.validator.ts          # Zod schemas
```

---

## 🔒 Security Features

### Password Security
- ✅ Bcrypt hashing (12 rounds)
- ✅ Minimum 8 characters
- ✅ Requires uppercase, lowercase, and number

### Token Security
- ✅ Access token: 15 minutes expiry
- ✅ Refresh token: 7 days expiry, HTTP-only cookie
- ✅ Verification token: 64 chars (256 bits), 24h expiry
- ✅ Reset token: 64 chars (256 bits), 1h expiry

### Rate Limiting
- ✅ Auth endpoints: 5 requests / 15 minutes
- ✅ Refresh endpoint: 10 requests / 15 minutes
- ✅ Resend/Reset: 3 requests / hour per email

### Other
- ✅ HTTPS mandatory in production
- ✅ CORS whitelist
- ✅ No email enumeration (consistent responses)
- ✅ Helmet security headers

---

## 🐛 Troubleshooting

### "JWT_SECRET must be defined"
→ Update `.env` with strong JWT secrets

### "RESEND_API_KEY not found"
→ Get API key from [resend.com](https://resend.com) and add to `.env`

### Migration error
→ Run migration manually: `npx prisma migrate dev`

### Email not sending
→ Check Resend API key and logs. In development, emails are logged to console.

### "Email not verified" error on login
→ Click verification link sent to email, or use resend endpoint

---

## 📝 Next Steps

- [ ] Write unit tests for auth.service
- [ ] Write integration tests for auth.routes
- [ ] Add 2FA support (V2)
- [ ] Implement refresh token invalidation on password change (V1)
- [ ] Add email templates for other languages (V1)

---

**Created:** 2026-02-02
**Status:** ✅ Production Ready
