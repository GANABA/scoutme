import { v2 as cloudinary } from 'cloudinary';

/**
 * Configuration Cloudinary
 * SPEC-MVP-005
 */

// Configuration Cloudinary avec variables d'environnement
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;

/**
 * Configuration d'upload pour les photos de profil joueur
 */
export const CLOUDINARY_UPLOAD_CONFIG = {
  folder: 'scoutme/players',
  allowed_formats: ['jpg', 'png', 'webp'],
  transformation: [
    {
      width: 800,
      height: 800,
      crop: 'limit',                   // Ne pas agrandir si plus petit
      quality: 'auto',                 // Compression automatique
      fetch_format: 'auto'             // Format optimal (WebP si supporté)
    }
  ],
  overwrite: false,
  unique_filename: true,
  use_filename: false,
  resource_type: 'image' as const
};
