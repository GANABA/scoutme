import { prisma } from '../config/database';
import { ChangeRecruiterStatusInput, ChangePlayerStatusInput } from '../validators/admin.validator';
import { RecruiterStatus, PlayerStatus } from '@prisma/client';

/**
 * Service: Gestion admin (validation recruteurs, modération joueurs)
 * SPEC-MVP-008
 */

/**
 * Récupérer les recruteurs en attente de validation
 */
export async function getPendingRecruiters(page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [recruiters, total] = await Promise.all([
    prisma.recruiter.findMany({
      where: { status: 'pending' },
      include: {
        user: {
          select: {
            email: true,
            emailVerified: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit
    }),
    prisma.recruiter.count({
      where: { status: 'pending' }
    })
  ]);

  return {
    recruiters,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Récupérer tous les recruteurs (avec filtre statut optionnel)
 */
export async function getAllRecruiters(
  status?: RecruiterStatus,
  page = 1,
  limit = 20
) {
  const skip = (page - 1) * limit;

  const where = status ? { status } : {};

  const [recruiters, total] = await Promise.all([
    prisma.recruiter.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            emailVerified: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.recruiter.count({ where })
  ]);

  return {
    recruiters,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Changer le statut d'un recruteur (approuver/rejeter/suspendre)
 */
export async function changeRecruiterStatus(
  recruiterId: string,
  adminId: string,
  data: ChangeRecruiterStatusInput
) {
  const recruiter = await prisma.recruiter.findUnique({
    where: { id: recruiterId }
  });

  if (!recruiter) {
    throw new Error('RECRUITER_NOT_FOUND');
  }

  const updatedRecruiter = await prisma.recruiter.update({
    where: { id: recruiterId },
    data: {
      status: data.status as RecruiterStatus,
      approvedBy: data.status === 'approved' ? adminId : null,
      approvedAt: data.status === 'approved' ? new Date() : null
    }
  });

  // Log action admin
  console.log(`[ADMIN] ${adminId} changed recruiter ${recruiterId} status to ${data.status}${data.reason ? ` - Reason: ${data.reason}` : ''}`);

  // TODO V1: Envoyer email notification au recruteur
  // TODO V1: Enregistrer dans audit trail (table AdminActions)

  return updatedRecruiter;
}

/**
 * Récupérer tous les joueurs (avec filtre statut optionnel)
 */
export async function getAllPlayers(
  status?: PlayerStatus,
  page = 1,
  limit = 20
) {
  const skip = (page - 1) * limit;

  const where = status ? { status } : {};

  const [players, total] = await Promise.all([
    prisma.player.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            emailVerified: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.player.count({ where })
  ]);

  return {
    players,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Changer le statut d'un joueur (suspendre/réactiver)
 */
export async function changePlayerStatus(
  playerId: string,
  adminId: string,
  data: ChangePlayerStatusInput
) {
  const player = await prisma.player.findUnique({
    where: { id: playerId }
  });

  if (!player) {
    throw new Error('PLAYER_NOT_FOUND');
  }

  const updatedPlayer = await prisma.player.update({
    where: { id: playerId },
    data: {
      status: data.status as PlayerStatus
    }
  });

  // Log action admin
  console.log(`[ADMIN] ${adminId} changed player ${playerId} status to ${data.status}${data.reason ? ` - Reason: ${data.reason}` : ''}`);

  // TODO V1: Envoyer email notification au joueur
  // TODO V1: Enregistrer dans audit trail

  return updatedPlayer;
}

/**
 * Récupérer les statistiques plateforme
 */
export async function getPlatformStats() {
  const [
    totalUsers,
    usersByType,
    recruitersByStatus,
    playersByStatus,
    newUsersToday,
    newUsersThisWeek
  ] = await Promise.all([
    prisma.user.count(),

    prisma.user.groupBy({
      by: ['userType'],
      _count: true
    }),

    prisma.recruiter.groupBy({
      by: ['status'],
      _count: true
    }),

    prisma.player.groupBy({
      by: ['status'],
      _count: true
    }),

    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),

    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })
  ]);

  const stats = {
    users: {
      total: totalUsers,
      players: usersByType.find(u => u.userType === 'player')?._count || 0,
      recruiters: usersByType.find(u => u.userType === 'recruiter')?._count || 0,
      admins: usersByType.find(u => u.userType === 'admin')?._count || 0
    },
    recruiters: {
      total: recruitersByStatus.reduce((sum, r) => sum + r._count, 0),
      pending: recruitersByStatus.find(r => r.status === 'pending')?._count || 0,
      approved: recruitersByStatus.find(r => r.status === 'approved')?._count || 0,
      rejected: recruitersByStatus.find(r => r.status === 'rejected')?._count || 0,
      suspended: recruitersByStatus.find(r => r.status === 'suspended')?._count || 0
    },
    players: {
      total: playersByStatus.reduce((sum, p) => sum + p._count, 0),
      active: playersByStatus.find(p => p.status === 'active')?._count || 0,
      suspended: playersByStatus.find(p => p.status === 'suspended')?._count || 0
    },
    recent: {
      newUsersToday,
      newUsersThisWeek,
      pendingRecruiters: recruitersByStatus.find(r => r.status === 'pending')?._count || 0
    }
  };

  return stats;
}
