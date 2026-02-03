/**
 * Utilitaires: Gestion URLs YouTube
 * SPEC-MVP-006
 */

/**
 * Regex pour différents formats d'URL YouTube
 */
const YOUTUBE_REGEX = [
  // Format standard: https://www.youtube.com/watch?v=VIDEO_ID
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,

  // Format court: https://youtu.be/VIDEO_ID
  /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,

  // Format embed: https://www.youtube.com/embed/VIDEO_ID
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,

  // Format mobile: https://m.youtube.com/watch?v=VIDEO_ID
  /(?:https?:\/\/)?m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/
];

/**
 * Extraire l'ID de vidéo YouTube depuis une URL
 * @param url - URL YouTube
 * @returns Video ID ou null si invalide
 */
export function extractYouTubeVideoId(url: string): string | null {
  for (const regex of YOUTUBE_REGEX) {
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Vérifier si l'URL est une URL YouTube valide
 * @param url - URL à vérifier
 * @returns true si valide, false sinon
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}

/**
 * Obtenir l'URL de la miniature YouTube
 * @param videoId - ID de la vidéo YouTube
 * @param quality - Qualité de la miniature
 * @returns URL de la miniature
 */
export function getYouTubeThumbnail(
  videoId: string,
  quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'
): string {
  const sizes = {
    default: 'default',      // 120x90
    medium: 'mqdefault',     // 320x180
    high: 'hqdefault',       // 480x360
    maxres: 'maxresdefault'  // 1280x720 (pas toujours disponible)
  };

  return `https://img.youtube.com/vi/${videoId}/${sizes[quality]}.jpg`;
}

/**
 * Normaliser l'URL YouTube (format standard)
 * @param url - URL YouTube à normaliser
 * @returns URL normalisée
 */
export function normalizeYouTubeUrl(url: string): string {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new Error('VIDEO_INVALID_URL');
  }
  return `https://www.youtube.com/watch?v=${videoId}`;
}
