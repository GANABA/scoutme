import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { getRefreshTokenCookieOptions } from '../utils/jwt.utils';

/**
 * Controller: Inscription utilisateur
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, userType } = req.body;

    const user = await authService.register({ email, password, userType });

    res.status(201).json({
      message: 'Compte créé avec succès. Veuillez vérifier votre email.',
      userId: user.id,
      email: user.email
    });
  } catch (error: any) {
    if (error.message === 'AUTH_EMAIL_DUPLICATE') {
      return res.status(400).json({
        error: 'Un compte avec cet email existe déjà',
        code: 'AUTH_EMAIL_DUPLICATE'
      });
    }
    next(error);
  }
}

/**
 * Controller: Connexion utilisateur
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    // Stocker le refresh token dans un cookie HTTP-only
    res.cookie('refreshToken', result.refreshToken, getRefreshTokenCookieOptions());

    res.status(200).json({
      accessToken: result.accessToken,
      user: result.user
    });
  } catch (error: any) {
    if (error.message === 'AUTH_INVALID_CREDENTIALS') {
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect',
        code: 'AUTH_INVALID_CREDENTIALS'
      });
    }
    if (error.message === 'AUTH_EMAIL_NOT_VERIFIED') {
      return res.status(401).json({
        error: 'Veuillez vérifier votre email avant de vous connecter',
        code: 'AUTH_EMAIL_NOT_VERIFIED'
      });
    }
    next(error);
  }
}

/**
 * Controller: Déconnexion utilisateur
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response) {
  // Supprimer le cookie refresh token
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });

  res.status(200).json({
    message: 'Déconnexion réussie'
  });
}

/**
 * Controller: Rafraîchir l'access token
 * POST /api/auth/refresh
 */
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token manquant',
        code: 'AUTH_REFRESH_TOKEN_MISSING'
      });
    }

    const accessToken = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      accessToken
    });
  } catch (error: any) {
    if (error.message === 'AUTH_INVALID_REFRESH_TOKEN' || error.message === 'AUTH_REFRESH_TOKEN_EXPIRED') {
      // Supprimer le cookie invalide
      res.clearCookie('refreshToken');

      return res.status(401).json({
        error: 'Refresh token invalide ou expiré',
        code: error.message
      });
    }
    next(error);
  }
}

/**
 * Controller: Vérifier l'email
 * GET /api/auth/verify-email?token=xxx
 */
export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        error: 'Token de vérification manquant',
        code: 'AUTH_VERIFICATION_TOKEN_MISSING'
      });
    }

    const user = await authService.verifyEmail(token);

    res.status(200).json({
      message: 'Email vérifié avec succès',
      email: user.email
    });
  } catch (error: any) {
    if (error.message === 'AUTH_INVALID_VERIFICATION_TOKEN') {
      return res.status(400).json({
        error: 'Token de vérification invalide',
        code: 'AUTH_INVALID_VERIFICATION_TOKEN'
      });
    }
    if (error.message === 'AUTH_VERIFICATION_TOKEN_EXPIRED') {
      return res.status(400).json({
        error: 'Token de vérification expiré',
        code: 'AUTH_VERIFICATION_TOKEN_EXPIRED'
      });
    }
    if (error.message === 'AUTH_EMAIL_ALREADY_VERIFIED') {
      return res.status(400).json({
        error: 'Email déjà vérifié',
        code: 'AUTH_EMAIL_ALREADY_VERIFIED'
      });
    }
    next(error);
  }
}

/**
 * Controller: Renvoyer l'email de vérification
 * POST /api/auth/resend-verification
 */
export async function resendVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;

    await authService.resendVerificationEmail(email);

    res.status(200).json({
      message: 'Si cet email existe, un nouveau lien de vérification a été envoyé',
      email
    });
  } catch (error: any) {
    if (error.message === 'AUTH_EMAIL_ALREADY_VERIFIED') {
      return res.status(400).json({
        error: 'Email déjà vérifié',
        code: 'AUTH_EMAIL_ALREADY_VERIFIED'
      });
    }
    if (error.message === 'AUTH_RATE_LIMIT_EXCEEDED') {
      return res.status(429).json({
        error: 'Trop de demandes. Veuillez réessayer dans 1 heure',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        retryAfter: 3600
      });
    }
    next(error);
  }
}

/**
 * Controller: Demander une réinitialisation de mot de passe
 * POST /api/auth/forgot-password
 */
export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;

    await authService.requestPasswordReset(email);

    // Toujours retourner succès (sécurité - pas d'énumération d'emails)
    res.status(200).json({
      message: 'Si cet email existe, vous recevrez un lien de réinitialisation',
      email
    });
  } catch (error: any) {
    if (error.message === 'AUTH_RATE_LIMIT_EXCEEDED') {
      return res.status(429).json({
        error: 'Trop de demandes. Veuillez réessayer dans 1 heure',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        retryAfter: 3600
      });
    }
    next(error);
  }
}

/**
 * Controller: Réinitialiser le mot de passe
 * POST /api/auth/reset-password
 */
export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, newPassword } = req.body;

    await authService.resetPassword(token, newPassword);

    res.status(200).json({
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error: any) {
    if (error.message === 'AUTH_INVALID_RESET_TOKEN') {
      return res.status(400).json({
        error: 'Token de réinitialisation invalide',
        code: 'AUTH_INVALID_RESET_TOKEN'
      });
    }
    if (error.message === 'AUTH_RESET_TOKEN_EXPIRED') {
      return res.status(400).json({
        error: 'Token de réinitialisation expiré',
        code: 'AUTH_RESET_TOKEN_EXPIRED'
      });
    }
    next(error);
  }
}
