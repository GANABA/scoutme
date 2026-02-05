import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/**
 * Instance unique du client Prisma (Singleton pattern)
 * Évite les multiples connexions à la base de données
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not defined");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
});

/**
 * Gestion de la déconnexion propre
 */
process.on("beforeExit", async () => {
  await prisma.$disconnect();
  await pool.end();
});

export default prisma;
