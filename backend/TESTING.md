# Guide de Tests - ScoutMe Backend

Ce document décrit la stratégie de tests automatisés pour le backend ScoutMe.

## Configuration

### Dépendances de Test

```bash
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

### Environnement de Test

Le fichier `.env.test` contient la configuration pour l'environnement de test :

```env
NODE_ENV=test
DATABASE_URL="postgresql://postgres:password@localhost:5432/scoutme_test"
JWT_SECRET="test_jwt_secret_key"
JWT_REFRESH_SECRET="test_jwt_refresh_secret_key"
```

**IMPORTANT:** Utilisez une base de données de test séparée pour éviter de corrompre vos données de développement.

## Structure des Tests

```
backend/
├── tests/
│   ├── setup.ts                    # Configuration globale des tests
│   ├── test-helpers.ts             # Helpers pour créer des données de test
│   ├── services/                   # Tests unitaires des services
│   │   ├── auth.service.test.ts
│   │   └── player.service.test.ts
│   └── routes/                     # Tests d'intégration des routes
│       ├── auth.routes.test.ts
│       └── player.routes.test.ts
└── jest.config.js                  # Configuration Jest
```

## Types de Tests

### 1. Tests Unitaires (Services)

Tests de la logique métier dans les services.

**Fichiers:** `tests/services/*.test.ts`

**Exemple:**
```typescript
describe('Player Service', () => {
  it('should create a new player profile', async () => {
    const user = await createTestUser('player');
    const player = await playerService.createPlayerProfile(user.id, data);
    expect(player).toBeDefined();
  });
});
```

**Couverts:**
- `auth.service.ts` - Inscription, connexion, refresh token
- `player.service.ts` - CRUD profil joueur, recherche

### 2. Tests d'Intégration (Routes)

Tests des endpoints API avec Supertest.

**Fichiers:** `tests/routes/*.test.ts`

**Exemple:**
```typescript
describe('POST /api/auth/register', () => {
  it('should register a new player user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email, password, userType: 'player' });
    expect(response.status).toBe(201);
  });
});
```

**Couverts:**
- `auth.routes.ts` - Authentification, refresh, logout
- `player.routes.ts` - CRUD profil, recherche (SPEC-MVP-009)

## Commandes de Test

### Exécuter Tous les Tests
```bash
npm test
```

### Mode Watch (Développement)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Tests par Catégorie

**Services uniquement:**
```bash
npm run test:services
```

**Routes uniquement:**
```bash
npm run test:routes
```

**Fichier spécifique:**
```bash
npm test -- tests/services/auth.service.test.ts
```

## Helpers de Test

Le fichier `tests/test-helpers.ts` fournit des fonctions utilitaires :

### Création d'Utilisateurs

```typescript
// Créer un utilisateur basique
const user = await createTestUser('player', { email: 'test@example.com' });

// Créer un joueur avec profil
const { user, player, token } = await createAuthenticatedPlayer();

// Créer un recruteur approuvé
const { user, recruiter, token } = await createAuthenticatedRecruiter('approved');

// Créer un admin
const { user, token } = await createAuthenticatedAdmin();
```

### Génération de Tokens

```typescript
// Token d'accès
const accessToken = generateAccessToken(userId, 'player');

// Token de refresh
const refreshToken = generateRefreshToken(userId);
```

### Nettoyage

```typescript
// Nettoyer toute la base de données
await cleanDatabase();
```

## Configuration Jest

**Fichier:** `jest.config.js`

Paramètres principaux :
- **preset:** `ts-jest` - Support TypeScript
- **testEnvironment:** `node` - Environnement Node.js
- **setupFilesAfterEnv:** Setup global avant chaque test
- **testTimeout:** 30000ms - Timeout pour tests lents
- **coverage:** Rapports de couverture HTML + LCOV

## Setup Global

**Fichier:** `tests/setup.ts`

Actions automatiques :
- **beforeAll:** Initialisation de l'environnement de test
- **afterAll:** Déconnexion Prisma
- **afterEach:** Nettoyage base de données (TRUNCATE)

Cela garantit que chaque test démarre avec une base de données propre.

## Bonnes Pratiques

### 1. Isolation des Tests

Chaque test doit être indépendant et ne pas dépendre de l'ordre d'exécution.

```typescript
afterEach(async () => {
  await cleanDatabase(); // Nettoyer après chaque test
});
```

### 2. Données de Test Réalistes

Utiliser des données qui ressemblent aux données réelles :

```typescript
const playerData = {
  fullName: 'John Doe',
  birthDate: '2000-05-15',
  country: 'France',
  primaryPosition: 'Striker',
  phone: '+33612345678',
};
```

### 3. Tests de Validation

Toujours tester les cas d'erreur et les validations :

```typescript
it('should return 400 for invalid email', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({ email: 'invalid-email', password: 'Test1234!' });
  expect(response.status).toBe(400);
});
```

### 4. Coverage Minimum

Objectif de couverture de code :
- **Services:** 80% minimum
- **Controllers:** 70% minimum
- **Routes:** 80% minimum

Vérifier avec :
```bash
npm run test:coverage
```

## Tests par Spec

### SPEC-MVP-001: Authentication
**Fichiers:**
- `tests/services/auth.service.test.ts`
- `tests/routes/auth.routes.test.ts`

**Coverage:**
- Inscription (player, recruiter)
- Connexion
- Refresh token
- Logout
- GET /me

### SPEC-MVP-004: Player Profile
**Fichiers:**
- `tests/services/player.service.test.ts`
- `tests/routes/player.routes.test.ts`

**Coverage:**
- Création profil
- Lecture profil (own + public)
- Mise à jour profil
- Suppression (soft delete)

### SPEC-MVP-009: Player Search
**Fichiers:**
- `tests/services/player.service.test.ts` (searchPlayers)
- `tests/routes/player.routes.test.ts` (GET /search)

**Coverage:**
- Filtres : position, pays, âge
- Pagination : page, limit
- Tri : createdAt, age
- Protection : requireApprovedRecruiter
- Cas d'erreur : recruiter pending, invalid filters

## CI/CD Integration

Les tests sont automatiquement exécutés dans le pipeline CI/CD :

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm test
  env:
    NODE_ENV: test
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

## Debugging Tests

### Mode Verbose

```bash
npm test -- --verbose
```

### Test Spécifique avec Logs

```bash
npm test -- tests/services/auth.service.test.ts --verbose
```

### Désactiver le Timeout

```typescript
it('should do something', async () => {
  // Code de test
}, 60000); // 60 secondes
```

## Tests Manquants (TODO)

Les tests suivants sont à implémenter :

**Services:**
- [ ] `recruiter.service.test.ts` - SPEC-MVP-007
- [ ] `admin.service.test.ts` - SPEC-MVP-008
- [ ] `video.service.test.ts` - SPEC-MVP-006
- [ ] `photo.service.test.ts` - SPEC-MVP-005

**Routes:**
- [ ] `recruiter.routes.test.ts` - SPEC-MVP-007
- [ ] `admin.routes.test.ts` - SPEC-MVP-008
- [ ] `video.routes.test.ts` - SPEC-MVP-006 (embedded dans player.routes)
- [ ] `photo.routes.test.ts` - SPEC-MVP-005 (embedded dans player.routes)

**E2E (Future):**
- [ ] Tests Playwright pour workflows complets

## Métriques Actuelles

**Coverage:**
- Services : Tests pour auth + player
- Routes : Tests pour auth + player
- Total : ~40% du backend couvert

**Tests créés:**
- auth.service.test.ts : 14 tests
- player.service.test.ts : 18 tests
- auth.routes.test.ts : 15 tests
- player.routes.test.ts : 20 tests

**Total : 67 tests**

## Ressources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/ladjs/supertest)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)

---

**Dernière mise à jour:** 2026-02-03
**Auteur:** ScoutMe Team
