import { z } from 'zod';

/**
 * Schéma de validation pour l'inscription
 */
export const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email requis' })
    .email('Format email invalide')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Mot de passe requis' })
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  userType: z.enum(['player', 'recruiter', 'admin'], {
    required_error: 'Type d\'utilisateur requis',
    invalid_type_error: 'Type d\'utilisateur invalide'
  })
});

/**
 * Schéma de validation pour la connexion
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email requis' })
    .email('Format email invalide')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Mot de passe requis' })
    .min(1, 'Mot de passe requis')
});

/**
 * Schéma de validation pour la demande de réinitialisation de mot de passe
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email requis' })
    .email('Format email invalide')
    .toLowerCase()
    .trim()
});

/**
 * Schéma de validation pour la réinitialisation de mot de passe
 */
export const resetPasswordSchema = z.object({
  token: z
    .string({ required_error: 'Token requis' })
    .length(64, 'Token invalide'),
  newPassword: z
    .string({ required_error: 'Nouveau mot de passe requis' })
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
});

/**
 * Schéma de validation pour le resend de l'email de vérification
 */
export const resendVerificationSchema = z.object({
  email: z
    .string({ required_error: 'Email requis' })
    .email('Format email invalide')
    .toLowerCase()
    .trim()
});

// Types TypeScript générés depuis les schémas Zod
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
