import * as adminService from '../../src/services/admin.service';
import { createTestUser, createTestRecruiter, createTestPlayer, cleanDatabase } from '../test-helpers';

describe('Admin Service', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  describe('getPendingRecruiters', () => {
    it('should return only pending recruiters', async () => {
      const user1 = await createTestUser('recruiter', { email: 'pending@test.com' });
      await createTestRecruiter(user1.id, { status: 'pending' });

      const user2 = await createTestUser('recruiter', { email: 'approved@test.com' });
      await createTestRecruiter(user2.id, { status: 'approved' });

      const result = await adminService.getPendingRecruiters();

      expect(result.recruiters.length).toBe(1);
      expect(result.recruiters[0].status).toBe('pending');
    });

    it('should paginate pending recruiters', async () => {
      for (let i = 0; i < 3; i++) {
        const user = await createTestUser('recruiter', { email: `pending${i}@test.com` });
        await createTestRecruiter(user.id, { status: 'pending' });
      }

      const result = await adminService.getPendingRecruiters(1, 2);

      expect(result.recruiters.length).toBe(2);
      expect(result.pagination.limit).toBe(2);
      expect(result.pagination.total).toBe(3);
    });
  });

  describe('getAllRecruiters', () => {
    it('should return all recruiters without filter', async () => {
      const user1 = await createTestUser('recruiter', { email: 'r1@test.com' });
      await createTestRecruiter(user1.id, { status: 'pending' });

      const user2 = await createTestUser('recruiter', { email: 'r2@test.com' });
      await createTestRecruiter(user2.id, { status: 'approved' });

      const result = await adminService.getAllRecruiters();

      expect(result.recruiters.length).toBe(2);
    });

    it('should filter recruiters by status', async () => {
      const user1 = await createTestUser('recruiter', { email: 'r1@test.com' });
      await createTestRecruiter(user1.id, { status: 'pending' });

      const user2 = await createTestUser('recruiter', { email: 'r2@test.com' });
      await createTestRecruiter(user2.id, { status: 'approved' });

      const result = await adminService.getAllRecruiters('approved');

      expect(result.recruiters.length).toBe(1);
      expect(result.recruiters[0].status).toBe('approved');
    });
  });

  describe('changeRecruiterStatus', () => {
    it('should change recruiter status to approved', async () => {
      const user = await createTestUser('recruiter');
      const recruiter = await createTestRecruiter(user.id, { status: 'pending' });
      const admin = await createTestUser('admin');

      const updated = await adminService.changeRecruiterStatus(
        recruiter.id,
        admin.id,
        {
          status: 'approved',
          reason: 'Organization verified',
        }
      );

      expect(updated.status).toBe('approved');
    });

    it('should change recruiter status to rejected', async () => {
      const user = await createTestUser('recruiter');
      const recruiter = await createTestRecruiter(user.id, { status: 'pending' });
      const admin = await createTestUser('admin');

      const updated = await adminService.changeRecruiterStatus(
        recruiter.id,
        admin.id,
        {
          status: 'rejected',
          reason: 'Invalid organization',
        }
      );

      expect(updated.status).toBe('rejected');
    });

    it('should throw error if recruiter not found', async () => {
      const admin = await createTestUser('admin');

      await expect(
        adminService.changeRecruiterStatus('non-existent-id', admin.id, {
          status: 'approved',
          reason: 'Test',
        })
      ).rejects.toThrow('RECRUITER_NOT_FOUND');
    });
  });

  describe('getAllPlayers', () => {
    it('should return all players without filter', async () => {
      const user1 = await createTestUser('player', { email: 'p1@test.com' });
      await createTestPlayer(user1.id, { status: 'active' });

      const user2 = await createTestUser('player', { email: 'p2@test.com' });
      await createTestPlayer(user2.id, { status: 'suspended' });

      const result = await adminService.getAllPlayers();

      expect(result.players.length).toBe(2);
    });

    it('should filter players by status', async () => {
      const user1 = await createTestUser('player', { email: 'p1@test.com' });
      await createTestPlayer(user1.id, { status: 'active' });

      const user2 = await createTestUser('player', { email: 'p2@test.com' });
      await createTestPlayer(user2.id, { status: 'suspended' });

      const result = await adminService.getAllPlayers('active');

      expect(result.players.length).toBe(1);
      expect(result.players[0].status).toBe('active');
    });
  });

  describe('changePlayerStatus', () => {
    it('should change player status to suspended', async () => {
      const user = await createTestUser('player');
      const player = await createTestPlayer(user.id, { status: 'active' });
      const admin = await createTestUser('admin');

      const updated = await adminService.changePlayerStatus(
        player.id,
        admin.id,
        {
          status: 'suspended',
          reason: 'Inappropriate content',
        }
      );

      expect(updated.status).toBe('suspended');
    });

    it('should throw error if player not found', async () => {
      const admin = await createTestUser('admin');

      await expect(
        adminService.changePlayerStatus('non-existent-id', admin.id, {
          status: 'suspended',
          reason: 'Test',
        })
      ).rejects.toThrow('PLAYER_NOT_FOUND');
    });
  });

  describe('getPlatformStats', () => {
    it('should return platform statistics', async () => {
      const playerUser = await createTestUser('player', { email: 'player@test.com' });
      await createTestPlayer(playerUser.id, { status: 'active' });

      const recruiterUser = await createTestUser('recruiter', { email: 'recruiter@test.com' });
      await createTestRecruiter(recruiterUser.id, { status: 'pending' });

      const stats = await adminService.getPlatformStats();

      expect(stats).toBeDefined();
      expect(stats.totalUsers).toBeGreaterThanOrEqual(2);
      expect(stats.totalPlayers).toBe(1);
      expect(stats.totalRecruiters).toBe(1);
      expect(stats.pendingRecruiters).toBe(1);
      expect(stats.activePlayers).toBe(1);
    });

    it('should return zero stats for empty platform', async () => {
      const stats = await adminService.getPlatformStats();

      expect(stats.totalUsers).toBe(0);
      expect(stats.totalPlayers).toBe(0);
      expect(stats.totalRecruiters).toBe(0);
    });
  });
});
