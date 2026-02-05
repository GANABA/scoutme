import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth.routes';
import { createTestUser, cleanDatabase } from '../test-helpers';
import cookieParser from 'cookie-parser';
import prisma from '../../src/config/database';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new player user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newplayer@example.com',
          password: 'SecurePass123!',
          userType: 'player',
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('newplayer@example.com');
      expect(response.body.user.userType).toBe('player');
      expect(response.body.accessToken).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should register a new recruiter user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'recruiter@example.com',
          password: 'SecurePass123!',
          userType: 'recruiter',
        });

      expect(response.status).toBe(201);
      expect(response.body.user.userType).toBe('recruiter');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123!',
          userType: 'player',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          userType: 'player',
        });

      expect(response.status).toBe(400);
    });

    it('should return 409 for duplicate email', async () => {
      await createTestUser('player', { email: 'existing@example.com' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'SecurePass123!',
          userType: 'player',
        });

      expect(response.status).toBe(409);
      expect(response.body.code).toBe('EMAIL_ALREADY_EXISTS');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      await createTestUser('player', {
        email: 'login@example.com',
        password: 'Test1234!',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Test1234!',
        });

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('login@example.com');
      expect(response.body.accessToken).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 for incorrect password', async () => {
      await createTestUser('player', {
        email: 'login@example.com',
        password: 'Test1234!',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword!',
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 401 for non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test1234!',
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const user = await createTestUser('player', {
        email: 'refresh@example.com',
        password: 'Test1234!',
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'refresh@example.com',
          password: 'Test1234!',
        });

      const cookies = loginResponse.headers['set-cookie'];

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.accessToken).not.toBe(loginResponse.body.accessToken);
    });

    it('should return 401 for missing refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh');

      expect(response.status).toBe(401);
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', ['refreshToken=invalid_token']);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout and clear refresh token cookie', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Déconnexion réussie');

      const setCookieHeader = response.headers['set-cookie'];
      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader[0]).toContain('refreshToken=;');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user info with valid token', async () => {
      const user = await createTestUser('player', {
        email: 'me@example.com',
        password: 'Test1234!',
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'me@example.com',
          password: 'Test1234!',
        });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(user.id);
      expect(response.body.email).toBe(user.email);
      expect(response.body.passwordHash).toBeUndefined();
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should accept request for existing email', async () => {
      await createTestUser('player', {
        email: 'forgot@example.com',
      });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'forgot@example.com',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });

    it('should return same response for non-existent email (security)', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com',
        });

      // Should not reveal if email exists
      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });

    it('should return 429 when rate limit exceeded', async () => {
      await createTestUser('player', {
        email: 'ratelimited@example.com',
      });

      // Make 3 requests (should succeed)
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'ratelimited@example.com' });

      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'ratelimited@example.com' });

      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'ratelimited@example.com' });

      // 4th request should fail
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'ratelimited@example.com' });

      expect(response.status).toBe(429);
      expect(response.body.code).toBe('AUTH_RATE_LIMIT_EXCEEDED');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'not-an-email',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      const user = await createTestUser('player', {
        email: 'resetpw@example.com',
        password: 'OldPassword123!',
      });

      // Request password reset
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'resetpw@example.com' });

      // Get reset token from DB
      const userWithToken = await prisma.user.findUnique({
        where: { id: user.id },
      });
      const resetToken = userWithToken?.resetToken;

      // Reset password
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'NewPassword456!',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();

      // Verify can login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'resetpw@example.com',
          password: 'NewPassword456!',
        });

      expect(loginResponse.status).toBe(200);
    });

    it('should return 400 for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token-xyz',
          newPassword: 'NewPassword123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('AUTH_INVALID_RESET_TOKEN');
    });

    it('should return 400 for expired token', async () => {
      const user = await createTestUser('player', {
        email: 'expiredtoken@example.com',
      });

      // Request password reset
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'expiredtoken@example.com' });

      // Get token and expire it manually
      const userWithToken = await prisma.user.findUnique({
        where: { id: user.id },
      });
      const resetToken = userWithToken?.resetToken;

      // Expire the token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetTokenExpires: new Date(Date.now() - 1000), // 1 second ago
        },
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'NewPassword123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('AUTH_RESET_TOKEN_EXPIRED');
    });

    it('should return 400 for weak password', async () => {
      const user = await createTestUser('player', {
        email: 'weakpw@example.com',
      });

      // Request password reset
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'weakpw@example.com' });

      // Get token
      const userWithToken = await prisma.user.findUnique({
        where: { id: user.id },
      });
      const resetToken = userWithToken?.resetToken;

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: '123', // Weak password
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });
});
