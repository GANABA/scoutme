import sizeOf from 'image-size';

/**
 * Utilitaires: Validation et traitement des photos
 * SPEC-MVP-005
 */

export interface PhotoValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
}

/**
 * Règles de validation des photos
 */
export const PHOTO_VALIDATION_RULES = {
  maxSizeBytes: 5 * 1024 * 1024,        // 5 MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  minWidth: 200,                         // 200px minimum
  minHeight: 200,                        // 200px minimum
  maxWidth: 4000,                        // 4000px maximum
  maxHeight: 4000                        // 4000px maximum
};

/**
 * Valider les dimensions d'une image
 * @param buffer - Buffer de l'image
 * @returns Résultat de validation
 */
export async function validatePhotoDimensions(
  buffer: Buffer
): Promise<PhotoValidationResult> {
  try {
    const dimensions = sizeOf(buffer);

    if (!dimensions.width || !dimensions.height) {
      return {
        valid: false,
        error: 'Impossible de lire les dimensions de l\'image',
        code: 'PHOTO_INVALID_DIMENSIONS'
      };
    }

    if (dimensions.width < PHOTO_VALIDATION_RULES.minWidth ||
        dimensions.height < PHOTO_VALIDATION_RULES.minHeight) {
      return {
        valid: false,
        error: `Les dimensions minimales sont ${PHOTO_VALIDATION_RULES.minWidth}x${PHOTO_VALIDATION_RULES.minHeight} pixels`,
        code: 'PHOTO_DIMENSIONS_TOO_SMALL'
      };
    }

    if (dimensions.width > PHOTO_VALIDATION_RULES.maxWidth ||
        dimensions.height > PHOTO_VALIDATION_RULES.maxHeight) {
      return {
        valid: false,
        error: `Les dimensions maximales sont ${PHOTO_VALIDATION_RULES.maxWidth}x${PHOTO_VALIDATION_RULES.maxHeight} pixels`,
        code: 'PHOTO_DIMENSIONS_TOO_LARGE'
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Fichier image invalide',
      code: 'PHOTO_INVALID_FILE'
    };
  }
}
