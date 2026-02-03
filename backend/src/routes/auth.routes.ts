import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { authRateLimiter, refreshTokenRateLimiter } from '../middlewares/rateLimiter';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema
} from '../validators/auth.validator';

const router = Router();

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
router.post(
  '/register',
  authRateLimiter,
  validateRequest(registerSchema),
  authController.register
);

/**
 * POST /api/auth/login
 * Connexion utilisateur
 */
router.post(
  '/login',
  authRateLimiter,
  validateRequest(loginSchema),
  authController.login
);

/**
 * POST /api/auth/logout
 * Déconnexion utilisateur
 */
router.post(
  '/logout',
  authController.logout
);

/**
 * POST /api/auth/refresh
 * Rafraîchir l'access token
 */
router.post(
  '/refresh',
  refreshTokenRateLimiter,
  authController.refresh
);

/**
 * GET /api/auth/verify-email?token=xxx
 * Vérifier l'email avec le token
 */
router.get(
  '/verify-email',
  authController.verifyEmail
);

/**
 * POST /api/auth/resend-verification
 * Renvoyer l'email de vérification
 */
router.post(
  '/resend-verification',
  authRateLimiter,
  validateRequest(resendVerificationSchema),
  authController.resendVerification
);

/**
 * POST /api/auth/forgot-password
 * Demander une réinitialisation de mot de passe
 */
router.post(
  '/forgot-password',
  authRateLimiter,
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword
);

/**
 * POST /api/auth/reset-password
 * Réinitialiser le mot de passe avec le token
 */
router.post(
  '/reset-password',
  authRateLimiter,
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);

export default router;
