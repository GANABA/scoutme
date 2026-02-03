import { Request, Response } from 'express';
import * as playerService from '../services/player.service';
import { formatPlayerResponse } from '../utils/player.utils';
import * as cloudinaryService from '../services/cloudinary.service';
import { validatePhotoDimensions } from '../utils/photo.utils';

/**
 * Controller: Gestion des profils joueurs
 * SPEC-MVP-004
 */

/**
 * POST /api/players
 * Créer un profil joueur
 */
export async function createPlayer(req: Request, res: Response) {
  try {
    // L'utilisateur est déjà authentifié et vérifié par les middlewares
    const userId = req.user!.userId;
    const data = req.body;

    const player = await playerService.createPlayerProfile(userId, data);
    const formattedPlayer = formatPlayerResponse(player);

    return res.status(201).json({
      message: 'Profil joueur créé avec succès',
      player: formattedPlayer
    });
  } catch (error: any) {
    if (error.message === 'PLAYER_PROFILE_EXISTS') {
      return res.status(409).json({
        error: 'Un profil joueur existe déjà pour cet utilisateur',
        code: 'PLAYER_PROFILE_EXISTS'
      });
    }

    console.error('Erreur création profil joueur:', error);
    return res.status(500).json({
      error: 'Erreur lors de la création du profil joueur',
      code: 'PLAYER_CREATE_ERROR'
    });
  }
}

/**
 * GET /api/players/:id
 * Récupérer un profil joueur par ID (public)
 */
export async function getPlayerById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const player = await playerService.getPlayerById(id);
    const formattedPlayer = formatPlayerResponse(player);

    return res.status(200).json({
      player: formattedPlayer
    });
  } catch (error: any) {
    if (error.message === 'PLAYER_NOT_FOUND') {
      return res.status(404).json({
        error: 'Profil joueur introuvable',
        code: 'PLAYER_NOT_FOUND'
      });
    }

    console.error('Erreur récupération profil joueur:', error);
    return res.status(500).json({
      error: 'Erreur lors de la récupération du profil joueur',
      code: 'PLAYER_GET_ERROR'
    });
  }
}

/**
 * GET /api/players/me
 * Récupérer le profil du joueur authentifié
 */
export async function getMyProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    const player = await playerService.getPlayerByUserId(userId);
    const formattedPlayer = formatPlayerResponse(player);

    return res.status(200).json({
      player: formattedPlayer
    });
  } catch (error: any) {
    if (error.message === 'PLAYER_PROFILE_NOT_FOUND') {
      return res.status(404).json({
        error: 'Aucun profil joueur associé à cet utilisateur',
        code: 'PLAYER_PROFILE_NOT_FOUND'
      });
    }

    console.error('Erreur récupération profil joueur:', error);
    return res.status(500).json({
      error: 'Erreur lors de la récupération du profil joueur',
      code: 'PLAYER_GET_ERROR'
    });
  }
}

/**
 * PUT /api/players/:id
 * Mettre à jour un profil joueur
 */
export async function updatePlayer(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;

    // Vérifier l'ownership: le profil appartient-il à l'utilisateur ?
    const existingPlayer = await playerService.getPlayerById(id);

    if (existingPlayer.userId !== req.user!.userId) {
      return res.status(403).json({
        error: 'Vous ne pouvez modifier que votre propre profil',
        code: 'AUTH_FORBIDDEN_OWNERSHIP'
      });
    }

    const updatedPlayer = await playerService.updatePlayerProfile(id, data);
    const formattedPlayer = formatPlayerResponse(updatedPlayer);

    return res.status(200).json({
      message: 'Profil joueur mis à jour avec succès',
      player: formattedPlayer
    });
  } catch (error: any) {
    if (error.message === 'PLAYER_NOT_FOUND') {
      return res.status(404).json({
        error: 'Profil joueur introuvable',
        code: 'PLAYER_NOT_FOUND'
      });
    }

    console.error('Erreur mise à jour profil joueur:', error);
    return res.status(500).json({
      error: 'Erreur lors de la mise à jour du profil joueur',
      code: 'PLAYER_UPDATE_ERROR'
    });
  }
}

/**
 * DELETE /api/players/:id
 * Supprimer un profil joueur (soft delete)
 */
export async function deletePlayer(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Vérifier l'ownership: le profil appartient-il à l'utilisateur ?
    const existingPlayer = await playerService.getPlayerById(id);

    // Autoriser si owner ou admin
    const isOwner = existingPlayer.userId === req.user!.userId;
    const isAdmin = req.user!.userType === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Vous ne pouvez supprimer que votre propre profil',
        code: 'AUTH_FORBIDDEN_OWNERSHIP'
      });
    }

    await playerService.deletePlayerProfile(id);

    return res.status(200).json({
      message: 'Profil joueur supprimé avec succès'
    });
  } catch (error: any) {
    if (error.message === 'PLAYER_NOT_FOUND') {
      return res.status(404).json({
        error: 'Profil joueur introuvable',
        code: 'PLAYER_NOT_FOUND'
      });
    }

    console.error('Erreur suppression profil joueur:', error);
    return res.status(500).json({
      error: 'Erreur lors de la suppression du profil joueur',
      code: 'PLAYER_DELETE_ERROR'
    });
  }
}

/**
 * POST /api/players/:id/photo
 * Upload photo de profil joueur
 * SPEC-MVP-005
 */
export async function uploadPlayerPhoto(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const file = req.file;

    // Vérifier que le fichier existe
    if (!file) {
      return res.status(400).json({
        error: 'Aucun fichier fourni',
        code: 'PHOTO_FILE_MISSING'
      });
    }

    // Vérifier ownership
    const player = await playerService.getPlayerById(id);
    if (player.userId !== req.user!.userId) {
      return res.status(403).json({
        error: 'Vous ne pouvez modifier que votre propre profil',
        code: 'AUTH_FORBIDDEN_OWNERSHIP'
      });
    }

    // Valider les dimensions de l'image
    const validation = await validatePhotoDimensions(file.buffer);
    if (!validation.valid) {
      return res.status(400).json({
        error: validation.error,
        code: validation.code
      });
    }

    // Upload vers Cloudinary
    const photoUrl = await cloudinaryService.uploadPlayerPhoto(
      file.buffer,
      id
    );

    // Supprimer l'ancienne photo si elle existe
    if (player.profilePhotoUrl) {
      const oldPublicId = cloudinaryService.extractPublicId(player.profilePhotoUrl);
      if (oldPublicId) {
        try {
          await cloudinaryService.deletePlayerPhoto(oldPublicId);
        } catch (error) {
          // Log l'erreur mais ne pas bloquer l'upload
          console.warn('Impossible de supprimer l\'ancienne photo:', error);
        }
      }
    }

    // Mettre à jour le profil avec la nouvelle URL
    await playerService.updatePlayerProfile(id, {
      profilePhotoUrl: photoUrl
    });

    return res.status(200).json({
      message: 'Photo de profil mise à jour avec succès',
      profilePhotoUrl: photoUrl
    });
  } catch (error: any) {
    if (error.message === 'PLAYER_NOT_FOUND') {
      return res.status(404).json({
        error: 'Profil joueur introuvable',
        code: 'PLAYER_NOT_FOUND'
      });
    }

    if (error.message === 'CLOUDINARY_UPLOAD_ERROR') {
      return res.status(500).json({
        error: 'Erreur lors de l\'upload vers Cloudinary',
        code: 'CLOUDINARY_UPLOAD_ERROR'
      });
    }

    console.error('Erreur upload photo:', error);
    return res.status(500).json({
      error: 'Erreur lors de l\'upload de la photo',
      code: 'PHOTO_UPLOAD_ERROR'
    });
  }
}

/**
 * DELETE /api/players/:id/photo
 * Supprimer la photo de profil d'un joueur
 * SPEC-MVP-005
 */
export async function deletePlayerPhoto(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Vérifier ownership
    const player = await playerService.getPlayerById(id);
    if (player.userId !== req.user!.userId) {
      return res.status(403).json({
        error: 'Vous ne pouvez modifier que votre propre profil',
        code: 'AUTH_FORBIDDEN_OWNERSHIP'
      });
    }

    // Vérifier qu'il y a une photo à supprimer
    if (!player.profilePhotoUrl) {
      return res.status(404).json({
        error: 'Aucune photo de profil à supprimer',
        code: 'PHOTO_NOT_FOUND'
      });
    }

    // Supprimer de Cloudinary
    const publicId = cloudinaryService.extractPublicId(player.profilePhotoUrl);
    if (publicId) {
      await cloudinaryService.deletePlayerPhoto(publicId);
    }

    // Mettre à jour le profil (enlever l'URL)
    await playerService.updatePlayerProfile(id, {
      profilePhotoUrl: null as any
    });

    return res.status(200).json({
      message: 'Photo de profil supprimée avec succès'
    });
  } catch (error: any) {
    if (error.message === 'PLAYER_NOT_FOUND') {
      return res.status(404).json({
        error: 'Profil joueur introuvable',
        code: 'PLAYER_NOT_FOUND'
      });
    }

    console.error('Erreur suppression photo:', error);
    return res.status(500).json({
      error: 'Erreur lors de la suppression de la photo',
      code: 'PHOTO_DELETE_ERROR'
    });
  }
}

/**
 * GET /api/players/search
 * Rechercher des joueurs selon critères
 * SPEC-MVP-009
 */
export async function searchPlayers(req: Request, res: Response) {
  try {
    const filters = req.query as any;

    const result = await playerService.searchPlayers(filters);

    // Formater les joueurs avec âge calculé
    const formattedPlayers = result.players.map(player =>
      formatPlayerResponse(player, false) // Public view, pas de champs sensibles
    );

    return res.status(200).json({
      players: formattedPlayers,
      pagination: result.pagination,
      filters: result.filters
    });
  } catch (error: any) {
    console.error('Erreur recherche joueurs:', error);
    return res.status(500).json({
      error: 'Erreur lors de la recherche de joueurs',
      code: 'PLAYER_SEARCH_ERROR'
    });
  }
}
