import { Request, Response } from 'express';
import * as recruiterService from '../services/recruiter.service';
import { formatRecruiterResponse } from '../utils/recruiter.utils';

/**
 * Controller: Gestion des profils recruteurs
 * SPEC-MVP-007
 */

/**
 * POST /api/recruiters
 * Créer un profil recruteur
 */
export async function createRecruiter(req: Request, res: Response) {
  try {
    // L'utilisateur est déjà authentifié et vérifié par les middlewares
    const userId = req.user!.userId;
    const data = req.body;

    const recruiter = await recruiterService.createRecruiterProfile(userId, data);
    const formattedRecruiter = formatRecruiterResponse(recruiter, true);

    return res.status(201).json({
      message: 'Profil recruteur créé avec succès. En attente de validation.',
      recruiter: formattedRecruiter
    });
  } catch (error: any) {
    if (error.message === 'RECRUITER_PROFILE_EXISTS') {
      return res.status(409).json({
        error: 'Un profil recruteur existe déjà pour cet utilisateur',
        code: 'RECRUITER_PROFILE_EXISTS'
      });
    }

    console.error('Erreur création profil recruteur:', error);
    return res.status(500).json({
      error: 'Erreur lors de la création du profil recruteur',
      code: 'RECRUITER_CREATE_ERROR'
    });
  }
}

/**
 * GET /api/recruiters/:id
 * Récupérer un profil recruteur par ID
 */
export async function getRecruiterById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const recruiter = await recruiterService.getRecruiterById(id);

    // Vérifier si l'utilisateur est owner ou admin
    const isOwner = req.user && recruiter.userId === req.user.userId;
    const isAdmin = req.user && req.user.userType === 'admin';
    const includeAdminFields = isOwner || isAdmin;

    // Si ni owner ni admin, interdire l'accès
    if (!includeAdminFields) {
      return res.status(403).json({
        error: 'Accès interdit',
        code: 'AUTH_FORBIDDEN'
      });
    }

    const formattedRecruiter = formatRecruiterResponse(recruiter, includeAdminFields);

    return res.status(200).json({
      recruiter: formattedRecruiter
    });
  } catch (error: any) {
    if (error.message === 'RECRUITER_NOT_FOUND') {
      return res.status(404).json({
        error: 'Profil recruteur introuvable',
        code: 'RECRUITER_NOT_FOUND'
      });
    }

    console.error('Erreur récupération profil recruteur:', error);
    return res.status(500).json({
      error: 'Erreur lors de la récupération du profil recruteur',
      code: 'RECRUITER_GET_ERROR'
    });
  }
}

/**
 * GET /api/recruiters/me
 * Récupérer le profil du recruteur authentifié
 */
export async function getMyProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const recruiter = await recruiterService.getRecruiterByUserId(userId);
    const formattedRecruiter = formatRecruiterResponse(recruiter, true);

    return res.status(200).json({
      recruiter: formattedRecruiter
    });
  } catch (error: any) {
    if (error.message === 'RECRUITER_PROFILE_NOT_FOUND') {
      return res.status(404).json({
        error: 'Aucun profil recruteur associé à cet utilisateur',
        code: 'RECRUITER_PROFILE_NOT_FOUND'
      });
    }

    console.error('Erreur récupération profil recruteur:', error);
    return res.status(500).json({
      error: 'Erreur lors de la récupération du profil recruteur',
      code: 'RECRUITER_GET_ERROR'
    });
  }
}

/**
 * PUT /api/recruiters/:id
 * Mettre à jour un profil recruteur
 */
export async function updateRecruiter(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;

    // Vérifier l'ownership: le profil appartient-il à l'utilisateur ?
    const existingRecruiter = await recruiterService.getRecruiterById(id);

    if (existingRecruiter.userId !== req.user!.userId) {
      return res.status(403).json({
        error: 'Vous ne pouvez modifier que votre propre profil',
        code: 'AUTH_FORBIDDEN_OWNERSHIP'
      });
    }

    const updatedRecruiter = await recruiterService.updateRecruiterProfile(id, data);
    const formattedRecruiter = formatRecruiterResponse(updatedRecruiter, true);

    return res.status(200).json({
      message: 'Profil recruteur mis à jour avec succès',
      recruiter: formattedRecruiter
    });
  } catch (error: any) {
    if (error.message === 'RECRUITER_NOT_FOUND') {
      return res.status(404).json({
        error: 'Profil recruteur introuvable',
        code: 'RECRUITER_NOT_FOUND'
      });
    }

    console.error('Erreur mise à jour profil recruteur:', error);
    return res.status(500).json({
      error: 'Erreur lors de la mise à jour du profil recruteur',
      code: 'RECRUITER_UPDATE_ERROR'
    });
  }
}

/**
 * DELETE /api/recruiters/:id
 * Supprimer un profil recruteur (soft delete)
 */
export async function deleteRecruiter(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Vérifier l'ownership: le profil appartient-il à l'utilisateur ?
    const existingRecruiter = await recruiterService.getRecruiterById(id);

    // Autoriser si owner ou admin
    const isOwner = existingRecruiter.userId === req.user!.userId;
    const isAdmin = req.user!.userType === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Vous ne pouvez supprimer que votre propre profil',
        code: 'AUTH_FORBIDDEN_OWNERSHIP'
      });
    }

    await recruiterService.deleteRecruiterProfile(id);

    return res.status(200).json({
      message: 'Profil recruteur supprimé avec succès'
    });
  } catch (error: any) {
    if (error.message === 'RECRUITER_NOT_FOUND') {
      return res.status(404).json({
        error: 'Profil recruteur introuvable',
        code: 'RECRUITER_NOT_FOUND'
      });
    }

    console.error('Erreur suppression profil recruteur:', error);
    return res.status(500).json({
      error: 'Erreur lors de la suppression du profil recruteur',
      code: 'RECRUITER_DELETE_ERROR'
    });
  }
}
