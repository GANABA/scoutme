import * as playerService from '../../src/services/player.service';
import { createTestUser, createTestPlayer, cleanDatabase } from '../test-helpers';

describe('Player Service', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  describe('createPlayerProfile', () => {
    it('should create a new player profile', async () => {
      const user = await createTestUser('player');

      const playerData = {
        fullName: 'John Doe',
        birthDate: '2000-05-15',
        country: 'France',
        city: 'Paris',
        primaryPosition: 'Striker' as const,
        secondaryPositions: ['Winger' as const],
        phone: '+33612345678',
      };

      const player = await playerService.createPlayerProfile(user.id, playerData);

      expect(player).toBeDefined();
      expect(player.fullName).toBe(playerData.fullName);
      expect(player.userId).toBe(user.id);
      expect(player.primaryPosition).toBe(playerData.primaryPosition);
      expect(player.status).toBe('active');
    });

    it('should throw error if profile already exists', async () => {
      const user = await createTestUser('player');
      await createTestPlayer(user.id);

      await expect(
        playerService.createPlayerProfile(user.id, {
          fullName: 'John Doe',
          birthDate: '2000-05-15',
          country: 'France',
          primaryPosition: 'Striker',
          phone: '+33612345678',
        })
      ).rejects.toThrow('PLAYER_PROFILE_EXISTS');
    });
  });

  describe('getPlayerById', () => {
    it('should return player by ID', async () => {
      const user = await createTestUser('player');
      const player = await createTestPlayer(user.id);

      const foundPlayer = await playerService.getPlayerById(player.id);

      expect(foundPlayer).toBeDefined();
      expect(foundPlayer.id).toBe(player.id);
      expect(foundPlayer.fullName).toBe(player.fullName);
    });

    it('should throw error if player not found', async () => {
      await expect(
        playerService.getPlayerById('non-existent-id')
      ).rejects.toThrow('PLAYER_NOT_FOUND');
    });
  });

  describe('getPlayerByUserId', () => {
    it('should return player by user ID', async () => {
      const user = await createTestUser('player');
      const player = await createTestPlayer(user.id);

      const foundPlayer = await playerService.getPlayerByUserId(user.id);

      expect(foundPlayer).toBeDefined();
      expect(foundPlayer.userId).toBe(user.id);
    });

    it('should throw error if profile not found', async () => {
      const user = await createTestUser('player');

      await expect(
        playerService.getPlayerByUserId(user.id)
      ).rejects.toThrow('PLAYER_PROFILE_NOT_FOUND');
    });
  });

  describe('updatePlayerProfile', () => {
    it('should update player profile', async () => {
      const user = await createTestUser('player');
      const player = await createTestPlayer(user.id, { fullName: 'Old Name' });

      const updated = await playerService.updatePlayerProfile(player.id, {
        fullName: 'New Name',
        city: 'Lyon',
      });

      expect(updated.fullName).toBe('New Name');
      expect(updated.city).toBe('Lyon');
      expect(updated.country).toBe(player.country);
    });

    it('should throw error if player not found', async () => {
      await expect(
        playerService.updatePlayerProfile('non-existent-id', { fullName: 'Test' })
      ).rejects.toThrow('PLAYER_NOT_FOUND');
    });
  });

  describe('deletePlayerProfile', () => {
    it('should soft delete player (status suspended)', async () => {
      const user = await createTestUser('player');
      const player = await createTestPlayer(user.id);

      await playerService.deletePlayerProfile(player.id);

      const deletedPlayer = await playerService.getPlayerById(player.id);
      expect(deletedPlayer.status).toBe('suspended');
    });

    it('should throw error if player not found', async () => {
      await expect(
        playerService.deletePlayerProfile('non-existent-id')
      ).rejects.toThrow('PLAYER_NOT_FOUND');
    });
  });

  describe('searchPlayers', () => {
    beforeEach(async () => {
      const user1 = await createTestUser('player', { email: 'player1@test.com' });
      await createTestPlayer(user1.id, {
        fullName: 'Striker France 20',
        birthDate: new Date('2004-01-01'),
        country: 'France',
        city: 'Paris',
        primaryPosition: 'Striker',
        secondaryPositions: [],
      });

      const user2 = await createTestUser('player', { email: 'player2@test.com' });
      await createTestPlayer(user2.id, {
        fullName: 'Midfielder Spain 25',
        birthDate: new Date('1999-01-01'),
        country: 'Spain',
        city: 'Madrid',
        primaryPosition: 'Central Midfielder',
        secondaryPositions: ['Striker'],
      });

      const user3 = await createTestUser('player', { email: 'player3@test.com' });
      await createTestPlayer(user3.id, {
        fullName: 'Goalkeeper France 30',
        birthDate: new Date('1994-01-01'),
        country: 'France',
        city: 'Lyon',
        primaryPosition: 'Goalkeeper',
        status: 'suspended',
      });
    });

    it('should return all active players without filters', async () => {
      const result = await playerService.searchPlayers({});

      expect(result.players.length).toBe(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter by position (primary)', async () => {
      const result = await playerService.searchPlayers({
        position: 'Striker',
      });

      expect(result.players.length).toBe(1);
      expect(result.players[0].primaryPosition).toBe('Striker');
    });

    it('should filter by position (secondary)', async () => {
      const result = await playerService.searchPlayers({
        position: 'Striker',
      });

      expect(result.players.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter by country (case insensitive)', async () => {
      const result = await playerService.searchPlayers({
        country: 'france',
      });

      expect(result.players.length).toBe(1);
      expect(result.players[0].country).toBe('France');
    });

    it('should filter by age range', async () => {
      const result = await playerService.searchPlayers({
        ageMin: 20,
        ageMax: 25,
      });

      expect(result.players.length).toBeGreaterThanOrEqual(1);
    });

    it('should combine multiple filters', async () => {
      const result = await playerService.searchPlayers({
        position: 'Striker',
        country: 'France',
        ageMin: 18,
        ageMax: 22,
      });

      expect(result.players.length).toBe(1);
    });

    it('should paginate results', async () => {
      const result = await playerService.searchPlayers({
        page: 1,
        limit: 1,
      });

      expect(result.players.length).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(1);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.totalPages).toBe(2);
    });

    it('should sort by createdAt descending', async () => {
      const result = await playerService.searchPlayers({
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.players.length).toBe(2);
    });

    it('should not include suspended players', async () => {
      const result = await playerService.searchPlayers({
        country: 'France',
      });

      const hasGoalkeeper = result.players.some(p => p.primaryPosition === 'Goalkeeper');
      expect(hasGoalkeeper).toBe(false);
    });
  });
});
