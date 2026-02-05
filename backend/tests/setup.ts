import prisma from '../src/config/database';

// Mock email service to prevent actual emails from being sent during tests
jest.mock('../src/services/email.service', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendRecruiterApprovalEmail: jest.fn().mockResolvedValue(undefined),
  sendRecruiterRejectionEmail: jest.fn().mockResolvedValue(undefined),
}));

// Configuration globale des tests
beforeAll(async () => {
  console.log('Test environment: Starting test suite...');
});

afterAll(async () => {
  // Nettoyer les connexions après tous les tests
  await prisma.$disconnect();
  console.log('Test environment: Test suite completed');
});

// Nettoyer la base de données entre chaque test
afterEach(async () => {
  // Supprimer toutes les données dans l'ordre des dépendances
  const tables = [
    'players',
    'recruiters',
    'users'
  ];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }
});
