import { Router } from 'express';
import * as playerController from '../controllers/player.controller';
import * as videoController from '../controllers/video.controller';
import { requireAuth, requirePlayer, requireApprovedRecruiter } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createPlayerSchema, updatePlayerSchema, searchPlayersSchema } from '../validators/player.validator';
import { addVideoSchema, updateVideoTitleSchema } from '../validators/video.validator';
import { uploadPhoto } from '../middlewares/upload.middleware';

const router = Router();

/**
 * Routes: Gestion des profils joueurs
 * SPEC-MVP-004
 */

/**
 * POST /api/players
 * Créer un profil joueur
 * Authentification requise + userType = 'player'
 */
router.post(
  '/',
  requireAuth,
  requirePlayer,
  validateRequest(createPlayerSchema),
  playerController.createPlayer
);

/**
 * GET /api/players/me
 * Récupérer le profil du joueur authentifié
 * Authentification requise + userType = 'player'
 * IMPORTANT: Cette route doit être AVANT /api/players/:id pour éviter confusion
 */
router.get(
  '/me',
  requireAuth,
  requirePlayer,
  playerController.getMyProfile
);

/**
 * GET /api/players/search
 * Rechercher des joueurs selon critères
 * Authentification requise + recruiter approuvé
 * SPEC-MVP-009
 * IMPORTANT: Cette route doit être AVANT /api/players/:id pour éviter confusion
 */
router.get(
  '/search',
  requireAuth,
  requireApprovedRecruiter,
  validateRequest(searchPlayersSchema),
  playerController.searchPlayers
);

/**
 * GET /api/players/:id
 * Récupérer un profil joueur par ID
 * Public (pas d'authentification requise)
 */
router.get(
  '/:id',
  playerController.getPlayerById
);

/**
 * PUT /api/players/:id
 * Mettre à jour un profil joueur
 * Authentification requise + ownership (propriétaire uniquement)
 */
router.put(
  '/:id',
  requireAuth,
  validateRequest(updatePlayerSchema),
  playerController.updatePlayer
);

/**
 * POST /api/players/:id/photo
 * Upload photo de profil joueur
 * Authentification requise + ownership
 * SPEC-MVP-005
 */
router.post(
  '/:id/photo',
  requireAuth,
  uploadPhoto.single('photo'),
  playerController.uploadPlayerPhoto
);

/**
 * DELETE /api/players/:id/photo
 * Supprimer la photo de profil d'un joueur
 * Authentification requise + ownership
 * SPEC-MVP-005
 */
router.delete(
  '/:id/photo',
  requireAuth,
  playerController.deletePlayerPhoto
);

/**
 * POST /api/players/:id/videos
 * Ajouter une vidéo YouTube au profil
 * Authentification requise + ownership
 * SPEC-MVP-006
 */
router.post(
  '/:id/videos',
  requireAuth,
  validateRequest(addVideoSchema),
  videoController.addVideo
);

/**
 * GET /api/players/:id/videos
 * Récupérer les vidéos d'un profil joueur
 * Public (pas d'authentification requise)
 * SPEC-MVP-006
 */
router.get(
  '/:id/videos',
  videoController.getVideos
);

/**
 * PUT /api/players/:id/videos/:videoId
 * Mettre à jour le titre d'une vidéo
 * Authentification requise + ownership
 * SPEC-MVP-006
 */
router.put(
  '/:id/videos/:videoId',
  requireAuth,
  validateRequest(updateVideoTitleSchema),
  videoController.updateVideoTitle
);

/**
 * DELETE /api/players/:id/videos/:videoId
 * Supprimer une vidéo du profil
 * Authentification requise + ownership
 * SPEC-MVP-006
 */
router.delete(
  '/:id/videos/:videoId',
  requireAuth,
  videoController.deleteVideo
);

/**
 * DELETE /api/players/:id
 * Supprimer un profil joueur (soft delete)
 * Authentification requise + ownership (propriétaire ou admin)
 */
router.delete(
  '/:id',
  requireAuth,
  playerController.deletePlayer
);

export default router;
