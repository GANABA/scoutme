/**
 * Script pour créer la base de données de test
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupTestDatabase() {
  console.log('🔧 Configuration de la base de données de test...\n');

  // Connexion à postgres (base par défaut) pour créer scoutme_test
  const adminClient = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'admin',
    database: 'postgres'
  });

  try {
    await adminClient.connect();
    console.log('✓ Connecté à PostgreSQL');

    // Vérifier si la base existe
    const checkDb = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = 'scoutme_test'"
    );

    if (checkDb.rows.length > 0) {
      console.log('ℹ Base de données scoutme_test existe déjà');

      // Fermer toutes les connexions actives
      await adminClient.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = 'scoutme_test'
          AND pid <> pg_backend_pid()
      `);

      // Supprimer et recréer
      await adminClient.query('DROP DATABASE scoutme_test');
      console.log('✓ Base de données scoutme_test supprimée');
    }

    // Créer la base
    await adminClient.query('CREATE DATABASE scoutme_test');
    console.log('✓ Base de données scoutme_test créée');

    await adminClient.end();

    // Connexion à la nouvelle base pour appliquer les migrations
    const testClient = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'admin',
      database: 'scoutme_test'
    });

    await testClient.connect();
    console.log('✓ Connecté à scoutme_test');

    // Appliquer les migrations SQL directement
    console.log('\n📦 Application des migrations...');

    const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
    const migrations = [
      '20260202105927_init',
      '20260202231143_add_auth_fields'
    ];

    for (const migration of migrations) {
      const sqlPath = path.join(migrationsDir, migration, 'migration.sql');
      if (fs.existsSync(sqlPath)) {
        const sql = fs.readFileSync(sqlPath, 'utf-8');
        await testClient.query(sql);
        console.log(`✓ Migration ${migration} appliquée`);
      } else {
        console.warn(`⚠ Migration ${migration} introuvable`);
      }
    }

    // Créer la table _prisma_migrations pour tracker les migrations
    await testClient.query(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id" VARCHAR(36) PRIMARY KEY,
        "checksum" VARCHAR(64) NOT NULL,
        "finished_at" TIMESTAMP WITH TIME ZONE,
        "migration_name" VARCHAR(255) NOT NULL,
        "logs" TEXT,
        "rolled_back_at" TIMESTAMP WITH TIME ZONE,
        "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0
      )
    `);

    // Enregistrer les migrations appliquées
    for (const migration of migrations) {
      await testClient.query(`
        INSERT INTO "_prisma_migrations" (id, checksum, migration_name, applied_steps_count, finished_at)
        VALUES (gen_random_uuid(), '', $1, 1, now())
        ON CONFLICT DO NOTHING
      `, [migration]);
    }

    await testClient.end();

    console.log('\n✅ Base de données de test configurée avec succès!');
    console.log('📊 Vous pouvez maintenant exécuter les tests avec:');
    console.log('   npm test');
    console.log('   ou');
    console.log('   powershell -ExecutionPolicy Bypass -File run-tests.ps1');

  } catch (error) {
    console.error('\n❌ Erreur lors de la configuration:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Assurez-vous que PostgreSQL est démarré:');
      console.error('   - Windows: Services → PostgreSQL');
      console.error('   - Docker: docker-compose up -d postgres');
    }

    process.exit(1);
  }
}

setupTestDatabase();
