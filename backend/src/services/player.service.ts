import { prisma } from '../config/database';
import { CreatePlayerInput, UpdatePlayerInput } from '../validators/player.validator';
import { Prisma } from '@prisma/client';

/**
 * Service: Gestion des profils joueurs
 * SPEC-MVP-004
 */

/**
 * Créer un profil joueur
 */
export async function createPlayerProfile(userId: string, data: CreatePlayerInput) {
  // Vérifier si un profil existe déjà pour cet utilisateur
  const existingProfile = await prisma.player.findUnique({
    where: { userId }
  });

  if (existingProfile) {
    throw new Error('PLAYER_PROFILE_EXISTS');
  }

  // Créer le profil joueur
  const player = await prisma.player.create({
    data: {
      userId,
      fullName: data.fullName,
      birthDate: new Date(data.birthDate),
      nationality: data.nationality,
      city: data.city,
      country: data.country,
      primaryPosition: data.primaryPosition,
      secondaryPositions: data.secondaryPositions || [],
      strongFoot: data.strongFoot,
      heightCm: data.heightCm,
      weightKg: data.weightKg,
      currentClub: data.currentClub,
      careerHistory: data.careerHistory,
      phone: data.phone,
      status: 'active'
    }
  });

  return player;
}

/**
 * Récupérer un profil joueur par ID
 */
export async function getPlayerById(playerId: string) {
  const player = await prisma.player.findUnique({
    where: { id: playerId }
  });

  if (!player) {
    throw new Error('PLAYER_NOT_FOUND');
  }

  return player;
}

/**
 * Récupérer le profil joueur d'un utilisateur
 */
export async function getPlayerByUserId(userId: string) {
  const player = await prisma.player.findUnique({
    where: { userId }
  });

  if (!player) {
    throw new Error('PLAYER_PROFILE_NOT_FOUND');
  }

  return player;
}

/**
 * Mettre à jour un profil joueur
 */
export async function updatePlayerProfile(playerId: string, data: UpdatePlayerInput) {
  // Vérifier que le profil existe
  const existingPlayer = await prisma.player.findUnique({
    where: { id: playerId }
  });

  if (!existingPlayer) {
    throw new Error('PLAYER_NOT_FOUND');
  }

  // Préparer les données de mise à jour
  const updateData: Prisma.PlayerUpdateInput = {};

  if (data.fullName !== undefined) updateData.fullName = data.fullName;
  if (data.birthDate !== undefined) updateData.birthDate = new Date(data.birthDate);
  if (data.nationality !== undefined) updateData.nationality = data.nationality;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.country !== undefined) updateData.country = data.country;
  if (data.primaryPosition !== undefined) updateData.primaryPosition = data.primaryPosition;
  if (data.secondaryPositions !== undefined) updateData.secondaryPositions = data.secondaryPositions;
  if (data.strongFoot !== undefined) updateData.strongFoot = data.strongFoot;
  if (data.heightCm !== undefined) updateData.heightCm = data.heightCm;
  if (data.weightKg !== undefined) updateData.weightKg = data.weightKg;
  if (data.currentClub !== undefined) updateData.currentClub = data.currentClub;
  if (data.careerHistory !== undefined) updateData.careerHistory = data.careerHistory;
  if (data.phone !== undefined) updateData.phone = data.phone;

  // Mettre à jour le profil
  const updatedPlayer = await prisma.player.update({
    where: { id: playerId },
    data: updateData
  });

  return updatedPlayer;
}

/**
 * Supprimer un profil joueur (soft delete: status = 'suspended')
 */
export async function deletePlayerProfile(playerId: string) {
  // Vérifier que le profil existe
  const existingPlayer = await prisma.player.findUnique({
    where: { id: playerId }
  });

  if (!existingPlayer) {
    throw new Error('PLAYER_NOT_FOUND');
  }

  // Soft delete: mettre le status à 'suspended'
  await prisma.player.update({
    where: { id: playerId },
    data: { status: 'suspended' }
  });

  return { success: true };
}

/**
 * Supprimer définitivement un profil joueur (hard delete - admin uniquement)
 */
export async function permanentlyDeletePlayerProfile(playerId: string) {
  // Vérifier que le profil existe
  const existingPlayer = await prisma.player.findUnique({
    where: { id: playerId }
  });

  if (!existingPlayer) {
    throw new Error('PLAYER_NOT_FOUND');
  }

  // Hard delete
  await prisma.player.delete({
    where: { id: playerId }
  });

  return { success: true };
}
