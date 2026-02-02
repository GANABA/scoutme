import { PrismaClient } from "@prisma/client";

/**
 * Instance unique du client Prisma (Singleton pattern)
 * Évite les multiples connexions à la base de données
 */
const prisma = new PrismaClient({
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
});

export default prisma;
