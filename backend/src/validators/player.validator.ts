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

/**
 * Schéma Zod: Recherche joueurs
 * SPEC-MVP-009
 */
export const searchPlayersSchema = z.object({
  position: z.enum(VALID_POSITIONS as [string, ...string[]], {
    errorMap: () => ({ message: 'Position invalide' })
  }).optional(),

  ageMin: z.coerce.number()
    .int('L\'âge minimum doit être un entier')
    .min(13, 'L\'âge minimum doit être au moins 13 ans')
    .max(45, 'L\'âge minimum ne peut pas dépasser 45 ans')
    .optional(),

  ageMax: z.coerce.number()
    .int('L\'âge maximum doit être un entier')
    .min(13, 'L\'âge maximum doit être au moins 13 ans')
    .max(45, 'L\'âge maximum ne peut pas dépasser 45 ans')
    .optional(),

  country: z.string()
    .min(2, 'Le pays doit contenir au moins 2 caractères')
    .max(100, 'Le pays ne peut pas dépasser 100 caractères')
    .trim()
    .optional(),

  page: z.coerce.number()
    .int('La page doit être un entier')
    .min(1, 'La page doit être au moins 1')
    .optional()
    .default(1),

  limit: z.coerce.number()
    .int('La limite doit être un entier')
    .min(1, 'La limite doit être au moins 1')
    .max(100, 'La limite ne peut pas dépasser 100')
    .optional()
    .default(20),

  sortBy: z.enum(['createdAt', 'age']).optional().default('createdAt'),

  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
}).refine(
  (data) => {
    if (data.ageMin && data.ageMax) {
      return data.ageMin <= data.ageMax;
    }
    return true;
  },
  {
    message: 'L\'âge minimum doit être inférieur ou égal à l\'âge maximum',
    path: ['ageMin']
  }
);

export type SearchPlayersInput = z.infer<typeof searchPlayersSchema>;
