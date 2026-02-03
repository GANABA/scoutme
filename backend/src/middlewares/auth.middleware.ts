import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';
import { UserType } from '@prisma/client';

// Étendre le type Request pour inclure l'utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        userType: UserType;
      };
    }
  }
}

/**
 * Middleware: Vérifier que l'utilisateur est authentifié
 * Vérifie le JWT access token dans le header Authorization
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token d\'authentification manquant',
        code: 'AUTH_TOKEN_MISSING'
      });
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // Vérifier et décoder le token
    const decoded = verifyAccessToken(token);

    // Attacher l'utilisateur à la requête
    req.user = {
      userId: decoded.userId,
      email: decoded.email!,
      userType: decoded.userType!
    };

    next();
  } catch (error: any) {
    if (error.message === 'AUTH_ACCESS_TOKEN_EXPIRED') {
      return res.status(401).json({
        error: 'Token expiré',
        code: 'AUTH_ACCESS_TOKEN_EXPIRED'
      });
    }
    if (error.message === 'AUTH_INVALID_ACCESS_TOKEN') {
      return res.status(401).json({
        error: 'Token invalide',
        code: 'AUTH_INVALID_ACCESS_TOKEN'
      });
    }
    return res.status(401).json({
      error: 'Authentification échouée',
      code: 'AUTH_FAILED'
    });
  }
}

/**
 * Middleware: Vérifier que l'utilisateur est un joueur
 */
export function requirePlayer(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.userType !== 'player') {
    return res.status(403).json({
      error: 'Accès réservé aux joueurs',
      code: 'AUTH_FORBIDDEN_PLAYER_ONLY'
    });
  }
  next();
}

/**
 * Middleware: Vérifier que l'utilisateur est un recruteur
 */
export function requireRecruiter(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.userType !== 'recruiter') {
    return res.status(403).json({
      error: 'Accès réservé aux recruteurs',
      code: 'AUTH_FORBIDDEN_RECRUITER_ONLY'
    });
  }
  next();
}

/**
 * Middleware: Vérifier que l'utilisateur est un admin
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.userType !== 'admin') {
    return res.status(403).json({
      error: 'Accès réservé aux administrateurs',
      code: 'AUTH_FORBIDDEN_ADMIN_ONLY'
    });
  }
  next();
}

/**
 * Middleware: Vérifier que l'utilisateur accède à ses propres ressources
 * Vérifie que le paramètre :id ou :userId correspond à l'utilisateur connecté
 */
export function requireOwnership(req: Request, res: Response, next: NextFunction) {
  const resourceId = req.params.id || req.params.userId;

  if (!req.user) {
    return res.status(401).json({
      error: 'Non authentifié',
      code: 'AUTH_TOKEN_MISSING'
    });
  }

  if (resourceId !== req.user.userId) {
    return res.status(403).json({
      error: 'Vous ne pouvez accéder qu\'à vos propres ressources',
      code: 'AUTH_FORBIDDEN_OWNERSHIP'
    });
  }

  next();
}

/**
 * Middleware: Vérifier que le recruteur est approuvé
 * SPEC-MVP-007: Restreindre l'accès aux fonctionnalités selon le statut
 */
export async function requireApprovedRecruiter(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || req.user.userType !== 'recruiter') {
      return res.status(403).json({
        error: 'Accès réservé aux recruteurs',
        code: 'AUTH_FORBIDDEN_RECRUITER_ONLY'
      });
    }

    // Importer prisma dynamiquement pour éviter les dépendances circulaires
    const { prisma } = await import('../config/database');

    // Vérifier le statut du recruteur
    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: req.user.userId }
    });

    if (!recruiter) {
      return res.status(404).json({
        error: 'Profil recruteur introuvable',
        code: 'RECRUITER_PROFILE_NOT_FOUND'
      });
    }

    if (recruiter.status !== 'approved') {
      return res.status(403).json({
        error: 'Votre compte recruteur est en attente de validation',
        code: 'RECRUITER_NOT_APPROVED',
        status: recruiter.status
      });
    }

    next();
  } catch (error) {
    console.error('Erreur middleware requireApprovedRecruiter:', error);
    return res.status(500).json({
      error: 'Erreur lors de la vérification du statut recruteur',
      code: 'AUTH_CHECK_ERROR'
    });
  }
}
