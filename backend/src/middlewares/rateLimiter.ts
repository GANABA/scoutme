import rateLimit from 'express-rate-limit';

/**
 * Rate limiter pour les endpoints d'authentification (inscription, connexion)
 * Limite: 5 requêtes par 15 minutes par IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 requêtes
  message: {
    error: 'Trop de tentatives. Veuillez réessayer dans 15 minutes',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: 900 // secondes
  },
  standardHeaders: true, // Retourne les headers RateLimit-*
  legacyHeaders: false, // Désactive les headers X-RateLimit-*
  skipSuccessfulRequests: false // Compte toutes les requêtes
});

/**
 * Rate limiter pour le refresh token
 * Limite: 10 requêtes par 15 minutes par IP
 */
export const refreshTokenRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Maximum 10 requêtes
  message: {
    error: 'Trop de tentatives de rafraîchissement. Veuillez réessayer plus tard',
    code: 'REFRESH_RATE_LIMIT_EXCEEDED',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter général pour l'API
 * Limite: 100 requêtes par minute par IP
 */
export const generalApiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Maximum 100 requêtes
  message: {
    error: 'Trop de requêtes. Veuillez ralentir',
    code: 'API_RATE_LIMIT_EXCEEDED',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});
