import * as authService from '../../src/services/auth.service';
import { createTestUser, cleanDatabase } from '../test-helpers';
import bcrypt from 'bcrypt';
import prisma from '../../src/config/database';

describe('Auth Service', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        userType: 'player' as const,
      };

      const user = await authService.register(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.userType).toBe(userData.userType);
      // @ts-ignore - passwordHash exists on User but not on return type
      expect(user.passwordHash).toBeUndefined();
    });

    it('should throw error if email already exists', async () => {
      const email = 'duplicate@example.com';
      await createTestUser('player', { email });

      await expect(
        authService.register({
          email,
          password: 'Test1234!',
          userType: 'player',
        })
      ).rejects.toThrow('AUTH_EMAIL_DUPLICATE');
    });

    it('should create users with different userTypes', async () => {
      const playerUser = await authService.register({
        email: 'player@example.com',
        password: 'Test1234!',
        userType: 'player',
      });

      const recruiterUser = await authService.register({
        email: 'recruiter@example.com',
        password: 'Test1234!',
        userType: 'recruiter',
      });

      expect(playerUser.userType).toBe('player');
      expect(recruiterUser.userType).toBe('recruiter');
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      const password = 'Test1234!';
      const user = await createTestUser('player', { password });

      const result = await authService.login({ email: user.email, password });

      expect(result).toBeDefined();
      expect(result.user.id).toBe(user.id);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error with incorrect password', async () => {
      const user = await createTestUser('player', { password: 'Test1234!' });

      await expect(
        authService.login({ email: user.email, password: 'WrongPassword!' })
      ).rejects.toThrow('INVALID_CREDENTIALS');
    });

    it('should throw error with non-existent email', async () => {
      await expect(
        authService.login({ email: 'nonexistent@example.com', password: 'Test1234!' })
      ).rejects.toThrow('INVALID_CREDENTIALS');
    });
  });

  describe('refreshAccessToken', () => {
    it('should generate new access token from valid refresh token', async () => {
      const password = 'Test1234!';
      const user = await createTestUser('player', { password });
      const loginResult = await authService.login({ email: user.email, password });

      // Wait 1 second to ensure iat timestamp is different
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newAccessToken = await authService.refreshAccessToken(loginResult.refreshToken);

      expect(newAccessToken).toBeDefined();
      expect(newAccessToken).not.toBe(loginResult.accessToken);
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
      expect(foundUser!.id).toBe(user.id);
      expect(foundUser!.email).toBe(user.email);
    });

    it('should return null if user not found', async () => {
      const foundUser = await authService.getUserById('non-existent-id');
      expect(foundUser).toBeNull();
    });
  });

  describe('requestPasswordReset', () => {
    it('should send reset email for existing user', async () => {
      const user = await createTestUser('player', {
        email: 'reset@example.com',
      });

      // Should not throw
      await expect(
        authService.requestPasswordReset('reset@example.com')
      ).resolves.not.toThrow();

      // Verify user has reset token (by checking user in DB)
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(updatedUser?.resetToken).toBeDefined();
      expect(updatedUser?.resetTokenExpires).toBeDefined();
      expect(updatedUser?.resetRequestCount).toBe(1);
      expect(updatedUser?.lastResetRequest).toBeDefined();
    });

    it('should not throw for non-existent email (security)', async () => {
      // Should succeed silently to avoid email enumeration
      await expect(
        authService.requestPasswordReset('nonexistent@example.com')
      ).resolves.not.toThrow();
    });

    it('should enforce rate limiting (max 3 requests per hour)', async () => {
      const user = await createTestUser('player', {
        email: 'ratelimit@example.com',
      });

      // First 3 requests should succeed
      await authService.requestPasswordReset('ratelimit@example.com');
      await authService.requestPasswordReset('ratelimit@example.com');
      await authService.requestPasswordReset('ratelimit@example.com');

      // 4th request should throw
      await expect(
        authService.requestPasswordReset('ratelimit@example.com')
      ).rejects.toThrow('AUTH_RATE_LIMIT_EXCEEDED');
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const user = await createTestUser('player', {
        email: 'validtoken@example.com',
        password: 'OldPassword123!',
      });

      // Request password reset to get token
      await authService.requestPasswordReset('validtoken@example.com');

      // Get the reset token from DB
      const userWithToken = await prisma.user.findUnique({
        where: { id: user.id },
      });
      const resetToken = userWithToken?.resetToken;

      expect(resetToken).toBeDefined();

      // Reset password
      const newPassword = 'NewPassword456!';
      await authService.resetPassword(resetToken!, newPassword);

      // Verify password was changed
      const isNewPasswordValid = await bcrypt.compare(
        newPassword,
        (await prisma.user.findUnique({ where: { id: user.id } }))!.passwordHash
      );
      expect(isNewPasswordValid).toBe(true);

      // Verify reset token was cleared
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(updatedUser?.resetToken).toBeNull();
      expect(updatedUser?.resetTokenExpires).toBeNull();
      expect(updatedUser?.resetRequestCount).toBe(0);
    });

    it('should throw error with invalid token', async () => {
      await expect(
        authService.resetPassword('invalid-token-xyz', 'NewPassword123!')
      ).rejects.toThrow('AUTH_INVALID_RESET_TOKEN');
    });

    it('should throw error with expired token', async () => {
      const user = await createTestUser('player', {
        email: 'expired@example.com',
      });

      // Request password reset
      await authService.requestPasswordReset('expired@example.com');

      // Get token and manually expire it
      const userWithToken = await prisma.user.findUnique({
        where: { id: user.id },
      });
      const resetToken = userWithToken?.resetToken;

      // Set expiry to past
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetTokenExpires: new Date(Date.now() - 1000), // 1 second ago
        },
      });

      await expect(
        authService.resetPassword(resetToken!, 'NewPassword123!')
      ).rejects.toThrow('AUTH_RESET_TOKEN_EXPIRED');
    });
  });
});
