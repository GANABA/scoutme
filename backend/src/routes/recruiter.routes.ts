import { Router } from 'express';
import * as recruiterController from '../controllers/recruiter.controller';
import { requireAuth, requireRecruiter } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createRecruiterSchema, updateRecruiterSchema } from '../validators/recruiter.validator';

const router = Router();

/**
 * Routes: Gestion des profils recruteurs
 * SPEC-MVP-007
 */

/**
 * POST /api/recruiters
 * Créer un profil recruteur
 * Authentification requise + userType = 'recruiter'
 */
router.post(
  '/',
  requireAuth,
  requireRecruiter,
  validateRequest(createRecruiterSchema),
  recruiterController.createRecruiter
);

/**
 * GET /api/recruiters/me
 * Récupérer le profil du recruteur authentifié
 * Authentification requise + userType = 'recruiter'
 * IMPORTANT: Cette route doit être AVANT /api/recruiters/:id pour éviter confusion
 */
router.get(
  '/me',
  requireAuth,
  requireRecruiter,
  recruiterController.getMyProfile
);

/**
 * GET /api/recruiters/:id
 * Récupérer un profil recruteur par ID
 * Authentification requise (owner ou admin uniquement)
 */
router.get(
  '/:id',
  requireAuth,
  recruiterController.getRecruiterById
);

/**
 * PUT /api/recruiters/:id
 * Mettre à jour un profil recruteur
 * Authentification requise + ownership vérifié dans le controller
 * Note: Le statut ne peut être modifié que par un admin (SPEC-MVP-008)
 */
router.put(
  '/:id',
  requireAuth,
  validateRequest(updateRecruiterSchema),
  recruiterController.updateRecruiter
);

/**
 * DELETE /api/recruiters/:id
 * Supprimer un profil recruteur (soft delete: status = 'suspended')
 * Authentification requise + ownership ou admin
 */
router.delete(
  '/:id',
  requireAuth,
  recruiterController.deleteRecruiter
);

export default router;
