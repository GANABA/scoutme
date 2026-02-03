import crypto from 'crypto';

/**
 * Génère un token de vérification d'email aléatoire
 * @returns Token hexadécimal de 64 caractères (256 bits)
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calcule la date d'expiration du token de vérification (24 heures)
 * @returns Date d'expiration
 */
export function calculateVerificationTokenExpiry(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures
}

/**
 * Génère un token de réinitialisation de mot de passe
 * @returns Token hexadécimal de 64 caractères (256 bits)
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calcule la date d'expiration du token de reset (1 heure)
 * @returns Date d'expiration
 */
export function calculateResetTokenExpiry(): Date {
  return new Date(Date.now() + 60 * 60 * 1000); // 1 heure
}
