import { prisma } from '../config/database';
import {
  extractYouTubeVideoId,
  getYouTubeThumbnail,
  normalizeYouTubeUrl
} from '../utils/youtube.utils';

/**
 * Service: Gestion des vidéos YouTube pour profils joueurs
 * SPEC-MVP-006
 */

const MAX_VIDEOS_MVP = 3;

export interface VideoData {
  url: string;
  title?: string;
  videoId: string;
  thumbnailUrl: string;
  addedAt: string;
}

/**
 * Ajouter une vidéo au profil joueur
 */
export async function addVideoToPlayer(
  playerId: string,
  url: string,
  title?: string
): Promise<VideoData> {
  // Récupérer le profil
  const player = await prisma.player.findUnique({
    where: { id: playerId }
  });

  if (!player) {
    throw new Error('PLAYER_NOT_FOUND');
  }

  // Vérifier la limite de vidéos
  const currentVideos = (player.videoUrls as VideoData[]) || [];
  if (currentVideos.length >= MAX_VIDEOS_MVP) {
    throw new Error('VIDEO_LIMIT_REACHED');
  }

  // Extraire videoId et créer données vidéo
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new Error('VIDEO_INVALID_URL');
  }

  // Vérifier si la vidéo existe déjà
  const videoExists = currentVideos.some(v => v.videoId === videoId);
  if (videoExists) {
    throw new Error('VIDEO_ALREADY_EXISTS');
  }

  const normalizedUrl = normalizeYouTubeUrl(url);
  const thumbnailUrl = getYouTubeThumbnail(videoId, 'high');

  const videoData: VideoData = {
    url: normalizedUrl,
    title: title || undefined,
    videoId,
    thumbnailUrl,
    addedAt: new Date().toISOString()
  };

  // Ajouter la vidéo
  const updatedVideos = [...currentVideos, videoData];

  await prisma.player.update({
    where: { id: playerId },
    data: {
      videoUrls: updatedVideos as any
    }
  });

  return videoData;
}

/**
 * Récupérer les vidéos d'un joueur
 */
export async function getPlayerVideos(playerId: string) {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: { videoUrls: true }
  });

  if (!player) {
    throw new Error('PLAYER_NOT_FOUND');
  }

  const videos = (player.videoUrls as VideoData[]) || [];

  return {
    videos,
    totalVideos: videos.length,
    maxVideos: MAX_VIDEOS_MVP
  };
}

/**
 * Supprimer une vidéo
 */
export async function deleteVideoFromPlayer(playerId: string, videoId: string) {
  const player = await prisma.player.findUnique({
    where: { id: playerId }
  });

  if (!player) {
    throw new Error('PLAYER_NOT_FOUND');
  }

  const currentVideos = (player.videoUrls as VideoData[]) || [];
  const videoIndex = currentVideos.findIndex(v => v.videoId === videoId);

  if (videoIndex === -1) {
    throw new Error('VIDEO_NOT_FOUND');
  }

  const updatedVideos = currentVideos.filter(v => v.videoId !== videoId);

  await prisma.player.update({
    where: { id: playerId },
    data: {
      videoUrls: updatedVideos as any
    }
  });

  return {
    success: true,
    remainingVideos: updatedVideos.length
  };
}

/**
 * Mettre à jour le titre d'une vidéo
 */
export async function updateVideoTitle(
  playerId: string,
  videoId: string,
  title: string
): Promise<VideoData> {
  const player = await prisma.player.findUnique({
    where: { id: playerId }
  });

  if (!player) {
    throw new Error('PLAYER_NOT_FOUND');
  }

  const currentVideos = (player.videoUrls as VideoData[]) || [];
  const videoIndex = currentVideos.findIndex(v => v.videoId === videoId);

  if (videoIndex === -1) {
    throw new Error('VIDEO_NOT_FOUND');
  }

  const updatedVideos = [...currentVideos];
  updatedVideos[videoIndex] = {
    ...updatedVideos[videoIndex],
    title
  };

  await prisma.player.update({
    where: { id: playerId },
    data: {
      videoUrls: updatedVideos as any
    }
  });

  return updatedVideos[videoIndex];
}
