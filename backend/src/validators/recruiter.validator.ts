import { z } from 'zod';

/**
 * Validators: Profils recruteurs
 * SPEC-MVP-007
 */

/**
 * Types d'organisation valides
 */
export const ORGANIZATION_TYPES = [
  'club',      // Club professionnel
  'academy',   // Académie/Centre de formation
  'agency',    // Agence de joueurs
  'other'      // Autre
] as const;

export type OrganizationType = typeof ORGANIZATION_TYPES[number];

/**
 * Schéma Zod: Création profil recruteur
 */
export const createRecruiterSchema = z.object({
  fullName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(255, 'Le nom ne peut pas dépasser 255 caractères')
    .trim(),

  organizationName: z.string()
    .min(2, 'Le nom de l\'organisation doit contenir au moins 2 caractères')
    .max(255, 'Le nom de l\'organisation ne peut pas dépasser 255 caractères')
    .trim(),

  organizationType: z.enum(ORGANIZATION_TYPES as [string, ...string[]], {
    errorMap: () => ({ message: 'Type d\'organisation invalide' })
  }),

  country: z.string()
    .min(2, 'Le pays est requis')
    .max(100, 'Le pays ne peut pas dépasser 100 caractères')
    .trim(),

  contactEmail: z.string()
    .email('Format email invalide')
    .max(255, 'L\'email ne peut pas dépasser 255 caractères')
    .toLowerCase()
    .trim()
    .optional(),

  contactPhone: z.string()
    .min(8, 'Numéro de téléphone invalide')
    .max(50, 'Numéro de téléphone trop long')
    .trim()
});

/**
 * Schéma Zod: Mise à jour profil recruteur
 * Tous les champs deviennent optionnels
 */
export const updateRecruiterSchema = createRecruiterSchema.partial();

export type CreateRecruiterInput = z.infer<typeof createRecruiterSchema>;
export type UpdateRecruiterInput = z.infer<typeof updateRecruiterSchema>;
