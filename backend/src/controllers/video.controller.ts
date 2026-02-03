import { Request, Response } from 'express';
import * as videoService from '../services/video.service';
import * as playerService from '../services/player.service';

/**
 * Controller: Gestion des vidéos YouTube
 * SPEC-MVP-006
 */

/**
 * POST /api/players/:id/videos
 * Ajouter une vidéo YouTube
 */
export async function addVideo(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { url, title } = req.body;

    // Vérifier ownership
    const player = await playerService.getPlayerById(id);
    if (player.userId !== req.user!.userId) {
      return res.status(403).json({
        error: 'Vous ne pouvez modifier que votre propre profil',
        code: 'AUTH_FORBIDDEN_OWNERSHIP'
      });
    }

    const video = await videoService.addVideoToPlayer(id, url, title);
    const videosInfo = await videoService.getPlayerVideos(id);

    return res.status(201).json({
      message: 'Vidéo ajoutée avec succès',
      video,
      totalVideos: videosInfo.totalVideos
    });
  } catch (error: any) {
    if (error.message === 'PLAYER_NOT_FOUND') {
      return res.status(404).json({
        error: 'Profil joueur introuvable',
        code: 'PLAYER_NOT_FOUND'
      });
    }
    if (error.message === 'VIDEO_LIMIT_REACHED') {
      return res.status(400).json({
        error: 'Limite de 3 vidéos atteinte',
        code: 'VIDEO_LIMIT_REACHED',
        maxVideos: 3
      });
    }
    if (error.message === 'VIDEO_INVALID_URL') {
      return res.status(400).json({
        error: 'URL YouTube invalide',
        code: 'VIDEO_INVALID_URL'
      });
    }
    if (error.message === 'VIDEO_ALREADY_EXISTS') {
      return res.status(409).json({
        error: 'Cette vidéo existe déjà dans votre profil',
        code: 'VIDEO_ALREADY_EXISTS'
      });
    }

    console.error('Erreur ajout vidéo:', error);
    return res.status(500).json({
      error: 'Erreur lors de l\'ajout de la vidéo',
      code: 'VIDEO_ADD_ERROR'
    });
  }
}

/**
 * GET /api/players/:id/videos
 * Récupérer les vidéos d'un joueur
 */
export async function getVideos(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await videoService.getPlayerVideos(id);
    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'PLAYER_NOT_FOUND') {
      return res.status(404).json({
        error: 'Profil joueur introuvable',
        code: 'PLAYER_NOT_FOUND'
      });
    }

    console.error('Erreur récupération vidéos:', error);
    return res.status(500).json({
      error: 'Erreur lors de la récupération des vidéos',
      code: 'VIDEO_GET_ERROR'
    });
  }
}

/**
 * DELETE /api/players/:id/videos/:videoId
 * Supprimer une vidéo
 */
export async function deleteVideo(req: Request, res: Response) {
  try {
    const { id, videoId } = req.params;

    // Vérifier ownership
    const player = await playerService.getPlayerById(id);
    if (player.userId !== req.user!.userId) {
      return res.status(403).json({
        error: 'Vous ne pouvez modifier que votre propre profil',
        code: 'AUTH_FORBIDDEN_OWNERSHIP'
      });
    }

    const result = await videoService.deleteVideoFromPlayer(id, videoId);

    return res.status(200).json({
      message: 'Vidéo supprimée avec succès',
      remainingVideos: result.remainingVideos
    });
  } catch (error: any) {
    if (error.message === 'PLAYER_NOT_FOUND') {
      return res.status(404).json({
        error: 'Profil joueur introuvable',
        code: 'PLAYER_NOT_FOUND'
      });
    }
    if (error.message === 'VIDEO_NOT_FOUND') {
      return res.status(404).json({
        error: 'Vidéo introuvable',
        code: 'VIDEO_NOT_FOUND'
      });
    }

    console.error('Erreur suppression vidéo:', error);
    return res.status(500).json({
      error: 'Erreur lors de la suppression de la vidéo',
      code: 'VIDEO_DELETE_ERROR'
    });
  }
}

/**
 * PUT /api/players/:id/videos/:videoId
 * Mettre à jour le titre d'une vidéo
 */
export async function updateVideoTitle(req: Request, res: Response) {
  try {
    const { id, videoId } = req.params;
    const { title } = req.body;

    // Vérifier ownership
    const player = await playerService.getPlayerById(id);
    if (player.userId !== req.user!.userId) {
      return res.status(403).json({
        error: 'Vous ne pouvez modifier que votre propre profil',
        code: 'AUTH_FORBIDDEN_OWNERSHIP'
      });
    }

    const video = await videoService.updateVideoTitle(id, videoId, title);

    return res.status(200).json({
      message: 'Vidéo mise à jour avec succès',
      video
    });
  } catch (error: any) {
    if (error.message === 'PLAYER_NOT_FOUND') {
      return res.status(404).json({
        error: 'Profil joueur introuvable',
        code: 'PLAYER_NOT_FOUND'
      });
    }
    if (error.message === 'VIDEO_NOT_FOUND') {
      return res.status(404).json({
        error: 'Vidéo introuvable',
        code: 'VIDEO_NOT_FOUND'
      });
    }

    console.error('Erreur mise à jour vidéo:', error);
    return res.status(500).json({
      error: 'Erreur lors de la mise à jour de la vidéo',
      code: 'VIDEO_UPDATE_ERROR'
    });
  }
}
