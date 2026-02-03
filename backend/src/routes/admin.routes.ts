import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import { changeRecruiterStatusSchema, changePlayerStatusSchema } from '../validators/admin.validator';

const router = Router();

/**
 * Routes: Administration (validation recruteurs, modération)
 * SPEC-MVP-008
 *
 * IMPORTANT: Toutes les routes admin requièrent:
 * - Authentification JWT
 * - userType = 'admin'
 */

/**
 * GET /api/admin/recruiters/pending
 * Liste des recruteurs en attente de validation
 * Query params: ?page=1&limit=20
 */
router.get(
  '/recruiters/pending',
  requireAuth,
  requireAdmin,
  adminController.getPendingRecruiters
);

/**
 * GET /api/admin/recruiters
 * Liste complète des recruteurs (tous statuts)
 * Query params: ?status=pending&page=1&limit=20
 */
router.get(
  '/recruiters',
  requireAuth,
  requireAdmin,
  adminController.getAllRecruiters
);

/**
 * PUT /api/admin/recruiters/:id/status
 * Changer le statut d'un recruteur (approuver/rejeter/suspendre)
 * Body: { status: 'approved|rejected|suspended', reason?: 'string' }
 */
router.put(
  '/recruiters/:id/status',
  requireAuth,
  requireAdmin,
  validateRequest(changeRecruiterStatusSchema),
  adminController.changeRecruiterStatus
);

/**
 * GET /api/admin/players
 * Liste complète des joueurs (tous statuts)
 * Query params: ?status=active&page=1&limit=20
 */
router.get(
  '/players',
  requireAuth,
  requireAdmin,
  adminController.getAllPlayers
);

/**
 * PUT /api/admin/players/:id/status
 * Changer le statut d'un joueur (suspendre/réactiver)
 * Body: { status: 'active|suspended', reason?: 'string' }
 */
router.put(
  '/players/:id/status',
  requireAuth,
  requireAdmin,
  validateRequest(changePlayerStatusSchema),
  adminController.changePlayerStatus
);

/**
 * GET /api/admin/stats
 * Statistiques plateforme
 */
router.get(
  '/stats',
  requireAuth,
  requireAdmin,
  adminController.getPlatformStats
);

export default router;
