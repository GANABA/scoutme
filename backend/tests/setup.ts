import { prisma } from '../src/config/database';

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
    'Video',
    'Player',
    'Recruiter',
    'User'
  ];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }
});
