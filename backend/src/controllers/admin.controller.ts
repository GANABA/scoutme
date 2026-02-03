import { Request, Response } from 'express';
import * as adminService from '../services/admin.service';
import { formatRecruiterResponse } from '../utils/recruiter.utils';
import { formatPlayerResponse } from '../utils/player.utils';

/**
 * Controller: Gestion admin
 * SPEC-MVP-008
 */

/**
 * GET /api/admin/recruiters/pending
 * Récupérer les recruteurs en attente de validation
 */
export async function getPendingRecruiters(req: Request, res: Response) {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const result = await adminService.getPendingRecruiters(page, limit);

    const formattedRecruiters = result.recruiters.map(r =>
      formatRecruiterResponse(r, true)
    );

    return res.status(200).json({
      recruiters: formattedRecruiters,
      pagination: result.pagination
    });
  } catch (error: any) {
    console.error('Erreur récupération recruteurs pending:', error);
    return res.status(500).json({
      error: 'Erreur lors de la récupération des recruteurs en attente',
      code: 'ADMIN_GET_PENDING_ERROR'
    });
  }
}

/**
 * GET /api/admin/recruiters
 * Récupérer tous les recruteurs (avec filtre statut optionnel)
 */
export async function getAllRecruiters(req: Request, res: Response) {
  try {
    const status = req.query.status as any;
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const result = await adminService.getAllRecruiters(status, page, limit);

    const formattedRecruiters = result.recruiters.map(r =>
      formatRecruiterResponse(r, true)
    );

    return res.status(200).json({
      recruiters: formattedRecruiters,
      pagination: result.pagination
    });
  } catch (error: any) {
    console.error('Erreur récupération recruteurs:', error);
    return res.status(500).json({
      error: 'Erreur lors de la récupération des recruteurs',
      code: 'ADMIN_GET_RECRUITERS_ERROR'
    });
  }
}

/**
 * PUT /api/admin/recruiters/:id/status
 * Changer le statut d'un recruteur
 */
export async function changeRecruiterStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;
    const adminId = req.user!.userId;

    const updatedRecruiter = await adminService.changeRecruiterStatus(id, adminId, data);
    const formattedRecruiter = formatRecruiterResponse(updatedRecruiter, true);

    return res.status(200).json({
      message: 'Statut du recruteur mis à jour avec succès',
      recruiter: formattedRecruiter
    });
  } catch (error: any) {
    if (error.message === 'RECRUITER_NOT_FOUND') {
      return res.status(404).json({
        error: 'Recruteur introuvable',
        code: 'RECRUITER_NOT_FOUND'
      });
    }

    console.error('Erreur changement statut recruteur:', error);
    return res.status(500).json({
      error: 'Erreur lors du changement de statut',
      code: 'ADMIN_CHANGE_STATUS_ERROR'
    });
  }
}

/**
 * GET /api/admin/players
 * Récupérer tous les joueurs (avec filtre statut optionnel)
 */
export async function getAllPlayers(req: Request, res: Response) {
  try {
    const status = req.query.status as any;
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const result = await adminService.getAllPlayers(status, page, limit);

    const formattedPlayers = result.players.map(p =>
      formatPlayerResponse(p, true)
    );

    return res.status(200).json({
      players: formattedPlayers,
      pagination: result.pagination
    });
  } catch (error: any) {
    console.error('Erreur récupération joueurs:', error);
    return res.status(500).json({
      error: 'Erreur lors de la récupération des joueurs',
      code: 'ADMIN_GET_PLAYERS_ERROR'
    });
  }
}

/**
 * PUT /api/admin/players/:id/status
 * Changer le statut d'un joueur
 */
export async function changePlayerStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;
    const adminId = req.user!.userId;

    const updatedPlayer = await adminService.changePlayerStatus(id, adminId, data);
    const formattedPlayer = formatPlayerResponse(updatedPlayer, true);

    return res.status(200).json({
      message: 'Statut du joueur mis à jour avec succès',
      player: formattedPlayer
    });
  } catch (error: any) {
    if (error.message === 'PLAYER_NOT_FOUND') {
      return res.status(404).json({
        error: 'Joueur introuvable',
        code: 'PLAYER_NOT_FOUND'
      });
    }

    console.error('Erreur changement statut joueur:', error);
    return res.status(500).json({
      error: 'Erreur lors du changement de statut',
      code: 'ADMIN_CHANGE_STATUS_ERROR'
    });
  }
}

/**
 * GET /api/admin/stats
 * Récupérer les statistiques plateforme
 */
export async function getPlatformStats(req: Request, res: Response) {
  try {
    const stats = await adminService.getPlatformStats();

    return res.status(200).json({
      stats
    });
  } catch (error: any) {
    console.error('Erreur récupération statistiques:', error);
    return res.status(500).json({
      error: 'Erreur lors de la récupération des statistiques',
      code: 'ADMIN_GET_STATS_ERROR'
    });
  }
}
