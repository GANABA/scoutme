import { Recruiter } from '@prisma/client';

/**
 * Utilitaires: Formatage profils recruteurs
 * SPEC-MVP-007
 */

/**
 * Labels pour les types d'organisation
 */
export const ORGANIZATION_LABELS = {
  club: 'Club Professionnel',
  academy: 'Académie/Centre de Formation',
  agency: 'Agence de Joueurs',
  other: 'Autre'
};

/**
 * Formater la réponse du profil recruteur
 * @param recruiter - Profil recruteur
 * @param includeAdminFields - Inclure les champs admin (userId, approvedBy, etc.)
 */
export function formatRecruiterResponse(
  recruiter: Recruiter,
  includeAdminFields = false
) {
  const base = {
    id: recruiter.id,
    fullName: recruiter.fullName,
    organizationName: recruiter.organizationName,
    organizationType: recruiter.organizationType,
    country: recruiter.country,
    contactEmail: recruiter.contactEmail,
    contactPhone: recruiter.contactPhone,
    status: recruiter.status,
    createdAt: recruiter.createdAt.toISOString(),
    updatedAt: recruiter.updatedAt.toISOString()
  };

  // Inclure champs admin seulement si owner ou admin
  if (includeAdminFields) {
    return {
      ...base,
      userId: recruiter.userId,
      approvedBy: recruiter.approvedBy,
      approvedAt: recruiter.approvedAt?.toISOString() || null
    };
  }

  return base;
}
