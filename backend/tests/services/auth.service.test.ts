import * as authService from '../../src/services/auth.service';
import { createTestUser, cleanDatabase } from '../test-helpers';
import bcrypt from 'bcrypt';

describe('Auth Service', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  describe('registerUser', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        userType: 'player' as const,
      };

      const user = await authService.registerUser(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.userType).toBe(userData.userType);
      expect(user.passwordHash).not.toBe(userData.password);

      const isPasswordValid = await bcrypt.compare(userData.password, user.passwordHash);
      expect(isPasswordValid).toBe(true);
    });

    it('should throw error if email already exists', async () => {
      const email = 'duplicate@example.com';
      await createTestUser('player', { email });

      await expect(
        authService.registerUser({
          email,
          password: 'Test1234!',
          userType: 'player',
        })
      ).rejects.toThrow('EMAIL_ALREADY_EXISTS');
    });

    it('should create users with different userTypes', async () => {
      const playerUser = await authService.registerUser({
        email: 'player@example.com',
        password: 'Test1234!',
        userType: 'player',
      });

      const recruiterUser = await authService.registerUser({
        email: 'recruiter@example.com',
        password: 'Test1234!',
        userType: 'recruiter',
      });

      expect(playerUser.userType).toBe('player');
      expect(recruiterUser.userType).toBe('recruiter');
    });
  });

  describe('loginUser', () => {
    it('should login user with correct credentials', async () => {
      const password = 'Test1234!';
      const user = await createTestUser('player', { password });

      const result = await authService.loginUser(user.email, password);

      expect(result).toBeDefined();
      expect(result.user.id).toBe(user.id);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error with incorrect password', async () => {
      const user = await createTestUser('player', { password: 'Test1234!' });

      await expect(
        authService.loginUser(user.email, 'WrongPassword!')
      ).rejects.toThrow('INVALID_CREDENTIALS');
    });

    it('should throw error with non-existent email', async () => {
      await expect(
        authService.loginUser('nonexistent@example.com', 'Test1234!')
      ).rejects.toThrow('INVALID_CREDENTIALS');
    });
  });

  describe('refreshAccessToken', () => {
    it('should generate new access token from valid refresh token', async () => {
      const password = 'Test1234!';
      const user = await createTestUser('player', { password });
      const loginResult = await authService.loginUser(user.email, password);

      const result = await authService.refreshAccessToken(loginResult.refreshToken);

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.accessToken).not.toBe(loginResult.accessToken);
    });

    it('should throw error with invalid refresh token', async () => {
      await expect(
        authService.refreshAccessToken('invalid_token')
      ).rejects.toThrow();
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const user = await createTestUser('player');

      const foundUser = await authService.getUserById(user.id);

      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(user.id);
      expect(foundUser.email).toBe(user.email);
    });

    it('should throw error if user not found', async () => {
      await expect(
        authService.getUserById('non-existent-id')
      ).rejects.toThrow('USER_NOT_FOUND');
    });
  });
});
