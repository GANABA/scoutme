import { z } from 'zod';

/**
 * Validators: Admin operations
 * SPEC-MVP-008
 */

/**
 * Statuts recruteur valides
 */
const RECRUITER_STATUSES = ['pending', 'approved', 'rejected', 'suspended'] as const;

/**
 * Statuts joueur valides
 */
const PLAYER_STATUSES = ['active', 'suspended'] as const;

/**
 * Schéma Zod: Changer statut recruteur
 */
export const changeRecruiterStatusSchema = z.object({
  status: z.enum(RECRUITER_STATUSES, {
    errorMap: () => ({ message: 'Statut invalide' })
  }),

  reason: z.string()
    .min(10, 'La raison doit contenir au moins 10 caractères')
    .max(500, 'La raison ne peut pas dépasser 500 caractères')
    .trim()
    .optional()
});

/**
 * Schéma Zod: Changer statut joueur
 */
export const changePlayerStatusSchema = z.object({
  status: z.enum(PLAYER_STATUSES, {
    errorMap: () => ({ message: 'Statut invalide' })
  }),

  reason: z.string()
    .min(10, 'La raison doit contenir au moins 10 caractères')
    .max(500, 'La raison ne peut pas dépasser 500 caractères')
    .trim()
    .optional()
});

export type ChangeRecruiterStatusInput = z.infer<typeof changeRecruiterStatusSchema>;
export type ChangePlayerStatusInput = z.infer<typeof changePlayerStatusSchema>;
