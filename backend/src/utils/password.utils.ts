import bcrypt from 'bcrypt';

/**
 * Hash un mot de passe avec bcrypt
 * @param password - Mot de passe en clair
 * @param rounds - Nombre de rounds de hashing (défaut: 12)
 * @returns Mot de passe hashé
 */
export async function hashPassword(password: string, rounds: number = 12): Promise<string> {
  return bcrypt.hash(password, rounds);
}

/**
 * Compare un mot de passe avec son hash
 * @param password - Mot de passe en clair
 * @param hash - Hash du mot de passe
 * @returns true si le mot de passe correspond, false sinon
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Valide la force d'un mot de passe
 * @param password - Mot de passe à valider
 * @throws Error si le mot de passe ne respecte pas les critères
 */
export function validatePasswordStrength(password: string): void {
  if (password.length < 8) {
    throw new Error('Le mot de passe doit contenir au moins 8 caractères');
  }

  if (!/[A-Z]/.test(password)) {
    throw new Error('Le mot de passe doit contenir au moins une majuscule');
  }

  if (!/[a-z]/.test(password)) {
    throw new Error('Le mot de passe doit contenir au moins une minuscule');
  }

  if (!/[0-9]/.test(password)) {
    throw new Error('Le mot de passe doit contenir au moins un chiffre');
  }
}
