import cloudinary, { CLOUDINARY_UPLOAD_CONFIG } from '../config/cloudinary.config';
import { Readable } from 'stream';

/**
 * Service: Gestion uploads Cloudinary
 * SPEC-MVP-005
 */

/**
 * Upload une photo de profil joueur vers Cloudinary
 * @param buffer - Buffer de l'image
 * @param playerId - ID du joueur (utilisé comme public_id)
 * @returns URL sécurisée de l'image uploadée
 */
export async function uploadPlayerPhoto(
  buffer: Buffer,
  playerId: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        ...CLOUDINARY_UPLOAD_CONFIG,
        public_id: `scoutme/players/${playerId}`
      },
      (error, result) => {
        if (error) {
          console.error('Erreur upload Cloudinary:', error);
          return reject(new Error('CLOUDINARY_UPLOAD_ERROR'));
        }
        if (!result) {
          return reject(new Error('CLOUDINARY_NO_RESULT'));
        }
        resolve(result.secure_url);
      }
    );

    // Convertir buffer en stream pour Cloudinary
    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
}

/**
 * Supprimer une photo de Cloudinary
 * @param publicId - Public ID de l'image (ex: scoutme/players/uuid)
 */
export async function deletePlayerPhoto(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Erreur suppression Cloudinary:', error);
    throw new Error('CLOUDINARY_DELETE_ERROR');
  }
}

/**
 * Extraire le public_id d'une URL Cloudinary
 * @param cloudinaryUrl - URL complète Cloudinary
 * @returns Public ID ou null si format invalide
 *
 * Exemple:
 * Input: https://res.cloudinary.com/scoutme/image/upload/v1234567890/scoutme/players/abc123.jpg
 * Output: scoutme/players/abc123
 */
export function extractPublicId(cloudinaryUrl: string): string | null {
  try {
    // Regex pour extraire le public_id de l'URL Cloudinary
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.\w+$/;
    const match = cloudinaryUrl.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Erreur extraction public_id:', error);
    return null;
  }
}
