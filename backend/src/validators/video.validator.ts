import { z } from 'zod';
import { isValidYouTubeUrl } from '../utils/youtube.utils';

/**
 * Validators: Vidéos YouTube
 * SPEC-MVP-006
 */

/**
 * Schéma Zod: Ajouter une vidéo
 */
export const addVideoSchema = z.object({
  url: z.string()
    .url('URL invalide')
    .refine(
      (url) => isValidYouTubeUrl(url),
      'URL YouTube invalide. Formats acceptés: youtube.com/watch?v=, youtu.be/, youtube.com/embed/'
    ),

  title: z.string()
    .max(100, 'Le titre ne peut pas dépasser 100 caractères')
    .trim()
    .optional()
});

/**
 * Schéma Zod: Mettre à jour le titre d'une vidéo
 */
export const updateVideoTitleSchema = z.object({
  title: z.string()
    .min(1, 'Le titre ne peut pas être vide')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères')
    .trim()
});

export type AddVideoInput = z.infer<typeof addVideoSchema>;
export type UpdateVideoTitleInput = z.infer<typeof updateVideoTitleSchema>;
