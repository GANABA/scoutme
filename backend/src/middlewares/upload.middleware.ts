import multer from 'multer';

/**
 * Middleware: Upload de fichiers avec Multer
 * SPEC-MVP-005
 */

// Configuration Multer pour upload en mémoire (buffer)
const storage = multer.memoryStorage();

/**
 * Filtre de validation des fichiers uploadés
 * Accepte uniquement: JPG, PNG, WebP
 */
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('PHOTO_INVALID_FILE'));
  }
};

/**
 * Configuration Multer pour upload de photos
 * - Stockage en mémoire (buffer)
 * - Taille max: 5 MB
 * - Formats acceptés: JPG, PNG, WebP
 */
export const uploadPhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1                     // 1 fichier à la fois
  }
});
