import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

// Créer l'application Express
const app: Application = express();

// ============================================
// MIDDLEWARES GLOBAUX
// ============================================

// Sécurité avec Helmet
app.use(helmet());

// CORS - Autoriser le frontend
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true, // Autoriser les cookies
  })
);

// Parser JSON
app.use(express.json());

// Parser cookies
app.use(cookieParser());

// Parser URL-encoded
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROUTES
// ============================================

// Import routes
import authRoutes from "./routes/auth.routes";
import playerRoutes from "./routes/player.routes";

// Route de santé (health check)
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Route racine
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "ScoutMe API - Football Scouting Platform",
    version: "0.1.0",
    documentation: "/api/docs", // TODO: Swagger/OpenAPI
  });
});

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/players", playerRoutes);

// TODO: Ajouter les autres routes
// app.use("/api/recruiters", recruitersRoutes);
// app.use("/api/admin", adminRoutes);

// ============================================
// GESTION DES ERREURS
// ============================================

// Route 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
  });
});

// Gestionnaire d'erreurs global
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("Error:", err);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;
