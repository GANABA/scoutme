import { z } from 'zod';

/**
 * Positions de football valides
 */
export const VALID_POSITIONS = [
  // Défenseurs
  'Goalkeeper',
  'Center Back',
  'Left Back',
  'Right Back',
  'Wing Back',

  // Milieux
  'Defensive Midfielder',
  'Central Midfielder',
  'Attacking Midfielder',
  'Left Midfielder',
  'Right Midfielder',
  'Winger',

  // Attaquants
  'Striker',
  'Forward',
  'Second Striker'
] as const;

export type Position = typeof VALID_POSITIONS[number];

/**
 * Schéma Zod: Création profil joueur
 */
export const createPlayerSchema = z.object({
  fullName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(255, 'Le nom ne peut pas dépasser 255 caractères')
    .trim(),

  birthDate: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ? age - 1
        : age;
      return adjustedAge >= 13 && adjustedAge <= 45;
    }, 'Le joueur doit avoir entre 13 et 45 ans'),

  nationality: z.string()
    .max(100, 'La nationalité ne peut pas dépasser 100 caractères')
    .trim()
    .optional(),

  city: z.string()
    .max(100, 'La ville ne peut pas dépasser 100 caractères')
    .trim()
    .optional(),

  country: z.string()
    .min(2, 'Le pays est requis')
    .max(100, 'Le pays ne peut pas dépasser 100 caractères')
    .trim(),

  primaryPosition: z.enum(VALID_POSITIONS as [string, ...string[]], {
    errorMap: () => ({ message: 'Position invalide' })
  }),

  secondaryPositions: z.array(
    z.enum(VALID_POSITIONS as [string, ...string[]])
  )
    .max(3, 'Maximum 3 positions secondaires')
    .optional()
    .default([]),

  strongFoot: z.enum(['left', 'right', 'both'])
    .optional(),

  heightCm: z.number()
    .int('La taille doit être un nombre entier')
    .min(140, 'Taille minimum: 140 cm')
    .max(220, 'Taille maximum: 220 cm')
    .optional(),

  weightKg: z.number()
    .int('Le poids doit être un nombre entier')
    .min(40, 'Poids minimum: 40 kg')
    .max(150, 'Poids maximum: 150 kg')
    .optional(),

  currentClub: z.string()
    .max(255, 'Le nom du club ne peut pas dépasser 255 caractères')
    .trim()
    .optional(),

  careerHistory: z.string()
    .max(5000, 'L\'historique ne peut pas dépasser 5000 caractères')
    .trim()
    .optional(),

  phone: z.string()
    .min(8, 'Numéro de téléphone invalide')
    .max(50, 'Numéro de téléphone trop long')
    .trim()
});

/**
 * Schéma Zod: Mise à jour profil joueur
 * Tous les champs deviennent optionnels
 */
export const updatePlayerSchema = createPlayerSchema.partial();

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
