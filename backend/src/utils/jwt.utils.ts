import jwt from 'jsonwebtoken';

// Types
interface AccessTokenPayload {
  userId: string;
  email: string;
  userType: 'player' | 'recruiter' | 'admin';
}

interface RefreshTokenPayload {
  userId: string;
  tokenVersion?: number; // Pour invalidation future
}

interface DecodedToken {
  userId: string;
  email?: string;
  userType?: 'player' | 'recruiter' | 'admin';
  tokenVersion?: number;
  iat: number;
  exp: number;
}

// Secrets (depuis variables d'environnement)
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be defined in environment variables');
}

/**
 * Génère un access token JWT
 * @param payload - Données à inclure dans le token
 * @returns JWT access token (expiration: 15 minutes)
 */
export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '15m', // 15 minutes
    algorithm: 'HS256'
  });
}

/**
 * Génère un refresh token JWT
 * @param payload - Données à inclure dans le token
 * @returns JWT refresh token (expiration: 7 jours)
 */
export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: '7d', // 7 jours
    algorithm: 'HS256'
  });
}

/**
 * Vérifie et décode un access token
 * @param token - JWT access token
 * @returns Payload décodé
 * @throws Error si le token est invalide ou expiré
 */
export function verifyAccessToken(token: string): DecodedToken {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('AUTH_ACCESS_TOKEN_EXPIRED');
    }
    throw new Error('AUTH_INVALID_ACCESS_TOKEN');
  }
}

/**
 * Vérifie et décode un refresh token
 * @param token - JWT refresh token
 * @returns Payload décodé
 * @throws Error si le token est invalide ou expiré
 */
export function verifyRefreshToken(token: string): DecodedToken {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as DecodedToken;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('AUTH_REFRESH_TOKEN_EXPIRED');
    }
    throw new Error('AUTH_INVALID_REFRESH_TOKEN');
  }
}

/**
 * Génère les options de cookie pour le refresh token
 * @returns Options de cookie sécurisé
 */
export function getRefreshTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS uniquement en production
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en millisecondes
    path: '/'
  };
}
