import { PrismaClient, User, UserType } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password.utils';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../utils/jwt.utils';
import {
  generateVerificationToken,
  calculateVerificationTokenExpiry,
  generateResetToken,
  calculateResetTokenExpiry
} from '../utils/token.utils';
import {
  sendVerificationEmail,
  sendPasswordResetEmail
} from './email.service';

const prisma = new PrismaClient();

// Types
interface RegisterInput {
  email: string;
  password: string;
  userType: UserType;
}

interface LoginInput {
  email: string;
  password: string;
}

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    userType: UserType;
    emailVerified: boolean;
  };
}

/**
 * Inscription d'un nouvel utilisateur
 * @param data - Données d'inscription
 * @returns Utilisateur créé (sans le mot de passe)
 */
export async function register(data: RegisterInput): Promise<Omit<User, 'passwordHash'>> {
  // Vérifier si l'email existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new Error('AUTH_EMAIL_DUPLICATE');
  }

  // Hasher le mot de passe
  const passwordHash = await hashPassword(data.password);

  // Générer token de vérification
  const verificationToken = generateVerificationToken();
  const verificationTokenExpires = calculateVerificationTokenExpiry();

  // Créer l'utilisateur
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      userType: data.userType,
      emailVerified: false,
      verificationToken,
      verificationTokenExpires
    }
  });

  // Envoyer email de vérification (async, ne pas bloquer)
  sendVerificationEmail(user.email, verificationToken).catch((error) => {
    console.error('Erreur envoi email de vérification:', error);
    // Ne pas faire échouer l'inscription si l'email échoue
  });

  // Retourner l'utilisateur sans le mot de passe
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Connexion d'un utilisateur
 * @param data - Identifiants de connexion
 * @returns Access token, refresh token et infos utilisateur
 */
export async function login(data: LoginInput): Promise<LoginResult> {
  // Chercher l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (!user) {
    throw new Error('AUTH_INVALID_CREDENTIALS');
  }

  // Vérifier le mot de passe
  const isPasswordValid = await comparePassword(data.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('AUTH_INVALID_CREDENTIALS');
  }

  // Vérifier si l'email est vérifié
  if (!user.emailVerified) {
    throw new Error('AUTH_EMAIL_NOT_VERIFIED');
  }

  // Générer les tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    userType: user.userType
  });

  const refreshToken = generateRefreshToken({
    userId: user.id
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      userType: user.userType,
      emailVerified: user.emailVerified
    }
  };
}

/**
 * Rafraîchir l'access token avec le refresh token
 * @param refreshToken - Refresh token JWT
 * @returns Nouvel access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  // Vérifier le refresh token
  const decoded = verifyRefreshToken(refreshToken);

  // Chercher l'utilisateur
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  });

  if (!user) {
    throw new Error('AUTH_USER_NOT_FOUND');
  }

  // Générer un nouvel access token
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    userType: user.userType
  });

  return accessToken;
}

/**
 * Vérifier l'email avec le token
 * @param token - Token de vérification
 * @returns Utilisateur vérifié
 */
export async function verifyEmail(token: string): Promise<Omit<User, 'passwordHash'>> {
  // Chercher l'utilisateur avec ce token
  const user = await prisma.user.findUnique({
    where: { verificationToken: token }
  });

  if (!user) {
    throw new Error('AUTH_INVALID_VERIFICATION_TOKEN');
  }

  // Vérifier si déjà vérifié
  if (user.emailVerified) {
    throw new Error('AUTH_EMAIL_ALREADY_VERIFIED');
  }

  // Vérifier l'expiration
  if (!user.verificationTokenExpires || user.verificationTokenExpires < new Date()) {
    throw new Error('AUTH_VERIFICATION_TOKEN_EXPIRED');
  }

  // Marquer comme vérifié
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null
    }
  });

  const { passwordHash: _, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
}

/**
 * Renvoyer l'email de vérification
 * @param email - Email de l'utilisateur
 */
export async function resendVerificationEmail(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    // Ne pas révéler si l'email existe ou non (sécurité)
    return;
  }

  // Vérifier si déjà vérifié
  if (user.emailVerified) {
    throw new Error('AUTH_EMAIL_ALREADY_VERIFIED');
  }

  // Vérifier rate limiting (max 3 par heure)
  if (user.verificationEmailCount >= 3) {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (user.lastVerificationEmailSent && user.lastVerificationEmailSent > hourAgo) {
      throw new Error('AUTH_RATE_LIMIT_EXCEEDED');
    }
    // Réinitialiser le compteur après 1 heure
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationEmailCount: 0 }
    });
  }

  // Générer nouveau token
  const verificationToken = generateVerificationToken();
  const verificationTokenExpires = calculateVerificationTokenExpiry();

  // Mettre à jour l'utilisateur
  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationToken,
      verificationTokenExpires,
      verificationEmailCount: { increment: 1 },
      lastVerificationEmailSent: new Date()
    }
  });

  // Envoyer email
  await sendVerificationEmail(user.email, verificationToken);
}

/**
 * Demander une réinitialisation de mot de passe
 * @param email - Email de l'utilisateur
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  // Ne pas révéler si l'email existe ou non (sécurité)
  if (!user) {
    return;
  }

  // Vérifier rate limiting (max 3 par heure)
  if (user.resetRequestCount >= 3) {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (user.lastResetRequest && user.lastResetRequest > hourAgo) {
      throw new Error('AUTH_RATE_LIMIT_EXCEEDED');
    }
    // Réinitialiser le compteur
    await prisma.user.update({
      where: { id: user.id },
      data: { resetRequestCount: 0 }
    });
  }

  // Générer token de reset
  const resetToken = generateResetToken();
  const resetTokenExpires = calculateResetTokenExpiry();

  // Mettre à jour l'utilisateur
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpires,
      resetRequestCount: { increment: 1 },
      lastResetRequest: new Date()
    }
  });

  // Envoyer email
  await sendPasswordResetEmail(user.email, resetToken);
}

/**
 * Réinitialiser le mot de passe avec le token
 * @param token - Token de réinitialisation
 * @param newPassword - Nouveau mot de passe
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  // Chercher l'utilisateur avec ce token
  const user = await prisma.user.findUnique({
    where: { resetToken: token }
  });

  if (!user) {
    throw new Error('AUTH_INVALID_RESET_TOKEN');
  }

  // Vérifier l'expiration
  if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
    throw new Error('AUTH_RESET_TOKEN_EXPIRED');
  }

  // Hasher le nouveau mot de passe
  const passwordHash = await hashPassword(newPassword);

  // Mettre à jour l'utilisateur
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpires: null,
      resetRequestCount: 0,
      lastResetRequest: null
    }
  });

  // TODO V1: Invalider tous les refresh tokens actifs
}

/**
 * Récupérer un utilisateur par ID
 * @param userId - ID de l'utilisateur
 * @returns Utilisateur (sans le mot de passe)
 */
export async function getUserById(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return null;
  }

  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
