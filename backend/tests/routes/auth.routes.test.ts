import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth.routes';
import { createTestUser, cleanDatabase } from '../test-helpers';
import cookieParser from 'cookie-parser';

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
});
