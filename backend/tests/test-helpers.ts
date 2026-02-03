import { prisma } from '../src/config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Helpers pour créer des données de test
 */

export async function createTestUser(userType: 'player' | 'recruiter' | 'admin', overrides?: any) {
  const password = overrides?.password || 'Test1234!';
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email: overrides?.email || `test-${Date.now()}@example.com`,
      passwordHash: hashedPassword,
      userType,
      ...overrides,
    },
  });
}

export async function createTestPlayer(userId: string, overrides?: any) {
  return prisma.player.create({
    data: {
      userId,
      fullName: overrides?.fullName || 'John Doe',
      birthDate: overrides?.birthDate || new Date('2000-05-15'),
      country: overrides?.country || 'France',
      city: overrides?.city || 'Paris',
      primaryPosition: overrides?.primaryPosition || 'Striker',
      secondaryPositions: overrides?.secondaryPositions || [],
      phone: overrides?.phone || '+33612345678',
      status: overrides?.status || 'active',
      ...overrides,
    },
  });
}

export async function createTestRecruiter(userId: string, overrides?: any) {
  return prisma.recruiter.create({
    data: {
      userId,
      fullName: overrides?.fullName || 'Jane Smith',
      organization: overrides?.organization || 'Test FC',
      country: overrides?.country || 'France',
      phone: overrides?.phone || '+33612345679',
      status: overrides?.status || 'pending',
      ...overrides,
    },
  });
}

export function generateAccessToken(userId: string, userType: 'player' | 'recruiter' | 'admin') {
  return jwt.sign(
    { userId, userType },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );
}

export function generateRefreshToken(userId: string) {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );
}

export async function createAuthenticatedPlayer() {
  const user = await createTestUser('player');
  const player = await createTestPlayer(user.id);
  const token = generateAccessToken(user.id, 'player');
  return { user, player, token };
}

export async function createAuthenticatedRecruiter(status: 'pending' | 'approved' | 'rejected' | 'suspended' = 'approved') {
  const user = await createTestUser('recruiter');
  const recruiter = await createTestRecruiter(user.id, { status });
  const token = generateAccessToken(user.id, 'recruiter');
  return { user, recruiter, token };
}

export async function createAuthenticatedAdmin() {
  const user = await createTestUser('admin');
  const token = generateAccessToken(user.id, 'admin');
  return { user, token };
}

export async function cleanDatabase() {
  const tables = ['Video', 'Player', 'Recruiter', 'User'];
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }
}
