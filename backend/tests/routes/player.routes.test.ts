import request from 'supertest';
import express from 'express';
import playerRoutes from '../../src/routes/player.routes';
import {
  createAuthenticatedPlayer,
  createAuthenticatedRecruiter,
  createTestUser,
  createTestPlayer,
  cleanDatabase,
} from '../test-helpers';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/players', playerRoutes);

describe('Player Routes', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/players', () => {
    it('should create player profile for authenticated player user', async () => {
      const { user, token } = await createAuthenticatedPlayer();

      await cleanDatabase();
      const newUser = await createTestUser('player', { email: user.email });

      const response = await request(app)
        .post('/api/players')
        .set('Authorization', `Bearer ${token}`)
        .send({
          fullName: 'John Doe',
          birthDate: '2000-05-15',
          country: 'France',
          city: 'Paris',
          primaryPosition: 'Striker',
          secondaryPositions: ['Winger'],
          phone: '+33612345678',
        });

      expect(response.status).toBe(201);
      expect(response.body.fullName).toBe('John Doe');
      expect(response.body.userId).toBe(newUser.id);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/players')
        .send({
          fullName: 'John Doe',
          birthDate: '2000-05-15',
          country: 'France',
          primaryPosition: 'Striker',
          phone: '+33612345678',
        });

      expect(response.status).toBe(401);
    });

    it('should return 403 for non-player users', async () => {
      const { token } = await createAuthenticatedRecruiter();

      const response = await request(app)
        .post('/api/players')
        .set('Authorization', `Bearer ${token}`)
        .send({
          fullName: 'John Doe',
          birthDate: '2000-05-15',
          country: 'France',
          primaryPosition: 'Striker',
          phone: '+33612345678',
        });

      expect(response.status).toBe(403);
    });

    it('should return 400 for invalid data', async () => {
      const { token } = await createAuthenticatedPlayer();

      const response = await request(app)
        .post('/api/players')
        .set('Authorization', `Bearer ${token}`)
        .send({
          fullName: 'J',
          birthDate: 'invalid-date',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/players/me', () => {
    it('should return current player profile', async () => {
      const { player, token } = await createAuthenticatedPlayer();

      const response = await request(app)
        .get('/api/players/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(player.id);
      expect(response.body.fullName).toBe(player.fullName);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/players/me');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/players/search', () => {
    beforeEach(async () => {
      const user1 = await createTestUser('player', { email: 'p1@test.com' });
      await createTestPlayer(user1.id, {
        fullName: 'Striker France',
        birthDate: new Date('2004-01-01'),
        country: 'France',
        primaryPosition: 'Striker',
      });

      const user2 = await createTestUser('player', { email: 'p2@test.com' });
      await createTestPlayer(user2.id, {
        fullName: 'Midfielder Spain',
        birthDate: new Date('1999-01-01'),
        country: 'Spain',
        primaryPosition: 'Central Midfielder',
      });
    });

    it('should search players for approved recruiter', async () => {
      const { token } = await createAuthenticatedRecruiter('approved');

      const response = await request(app)
        .get('/api/players/search')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.players).toBeDefined();
      expect(response.body.players.length).toBeGreaterThan(0);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter by position', async () => {
      const { token } = await createAuthenticatedRecruiter('approved');

      const response = await request(app)
        .get('/api/players/search?position=Striker')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.players.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter by country', async () => {
      const { token } = await createAuthenticatedRecruiter('approved');

      const response = await request(app)
        .get('/api/players/search?country=France')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.players.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter by age range', async () => {
      const { token } = await createAuthenticatedRecruiter('approved');

      const response = await request(app)
        .get('/api/players/search?ageMin=20&ageMax=25')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.players).toBeDefined();
    });

    it('should paginate results', async () => {
      const { token } = await createAuthenticatedRecruiter('approved');

      const response = await request(app)
        .get('/api/players/search?page=1&limit=1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.players.length).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/players/search');

      expect(response.status).toBe(401);
    });

    it('should return 403 for pending recruiter', async () => {
      const { token } = await createAuthenticatedRecruiter('pending');

      const response = await request(app)
        .get('/api/players/search')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('RECRUITER_NOT_APPROVED');
    });

    it('should return 403 for player users', async () => {
      const { token } = await createAuthenticatedPlayer();

      const response = await request(app)
        .get('/api/players/search')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });

    it('should return 400 for invalid age range', async () => {
      const { token } = await createAuthenticatedRecruiter('approved');

      const response = await request(app)
        .get('/api/players/search?ageMin=30&ageMax=20')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/players/:id', () => {
    it('should return player profile by ID (public)', async () => {
      const user = await createTestUser('player');
      const player = await createTestPlayer(user.id);

      const response = await request(app)
        .get(`/api/players/${player.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(player.id);
      expect(response.body.fullName).toBe(player.fullName);
    });

    it('should return 404 for non-existent player', async () => {
      const response = await request(app)
        .get('/api/players/non-existent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/players/:id', () => {
    it('should update own player profile', async () => {
      const { player, token } = await createAuthenticatedPlayer();

      const response = await request(app)
        .put(`/api/players/${player.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          fullName: 'Updated Name',
          city: 'Lyon',
        });

      expect(response.status).toBe(200);
      expect(response.body.fullName).toBe('Updated Name');
      expect(response.body.city).toBe('Lyon');
    });

    it('should return 401 without authentication', async () => {
      const user = await createTestUser('player');
      const player = await createTestPlayer(user.id);

      const response = await request(app)
        .put(`/api/players/${player.id}`)
        .send({ fullName: 'Updated' });

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid data', async () => {
      const { player, token } = await createAuthenticatedPlayer();

      const response = await request(app)
        .put(`/api/players/${player.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          birthDate: 'invalid-date',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/players/:id', () => {
    it('should soft delete own player profile', async () => {
      const { player, token } = await createAuthenticatedPlayer();

      const response = await request(app)
        .delete(`/api/players/${player.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const checkResponse = await request(app)
        .get(`/api/players/${player.id}`);

      expect(checkResponse.body.status).toBe('suspended');
    });

    it('should return 401 without authentication', async () => {
      const user = await createTestUser('player');
      const player = await createTestPlayer(user.id);

      const response = await request(app)
        .delete(`/api/players/${player.id}`);

      expect(response.status).toBe(401);
    });
  });
});
