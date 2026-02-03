import { prisma } from '../config/database';
import { CreateRecruiterInput, UpdateRecruiterInput } from '../validators/recruiter.validator';
import { Prisma } from '@prisma/client';

/**
 * Service: Gestion des profils recruteurs
 * SPEC-MVP-007
 */

/**
 * Créer un profil recruteur
 */
export async function createRecruiterProfile(userId: string, data: CreateRecruiterInput) {
  // Vérifier si un profil existe déjà pour cet utilisateur
  const existingProfile = await prisma.recruiter.findUnique({
    where: { userId }
  });

  if (existingProfile) {
    throw new Error('RECRUITER_PROFILE_EXISTS');
  }

  // Créer le profil recruteur avec status 'pending' par défaut
  const recruiter = await prisma.recruiter.create({
    data: {
      userId,
      fullName: data.fullName,
      organizationName: data.organizationName,
      organizationType: data.organizationType as any,
      country: data.country,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      status: 'pending' // Default status
    }
  });

  return recruiter;
}

/**
 * Récupérer un profil recruteur par ID
 */
export async function getRecruiterById(recruiterId: string) {
  const recruiter = await prisma.recruiter.findUnique({
    where: { id: recruiterId }
  });

  if (!recruiter) {
    throw new Error('RECRUITER_NOT_FOUND');
  }

  return recruiter;
}

/**
 * Récupérer le profil recruteur d'un utilisateur
 */
export async function getRecruiterByUserId(userId: string) {
  const recruiter = await prisma.recruiter.findUnique({
    where: { userId }
  });

  if (!recruiter) {
    throw new Error('RECRUITER_PROFILE_NOT_FOUND');
  }

  return recruiter;
}

/**
 * Mettre à jour un profil recruteur
 */
export async function updateRecruiterProfile(recruiterId: string, data: UpdateRecruiterInput) {
  // Vérifier que le profil existe
  const existingRecruiter = await prisma.recruiter.findUnique({
    where: { id: recruiterId }
  });

  if (!existingRecruiter) {
    throw new Error('RECRUITER_NOT_FOUND');
  }

  // Préparer les données de mise à jour
  const updateData: Prisma.RecruiterUpdateInput = {};

  if (data.fullName !== undefined) updateData.fullName = data.fullName;
  if (data.organizationName !== undefined) updateData.organizationName = data.organizationName;
  if (data.organizationType !== undefined) updateData.organizationType = data.organizationType as any;
  if (data.country !== undefined) updateData.country = data.country;
  if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail;
  if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone;

  // Mettre à jour le profil
  const updatedRecruiter = await prisma.recruiter.update({
    where: { id: recruiterId },
    data: updateData
  });

  return updatedRecruiter;
}

/**
 * Supprimer un profil recruteur (soft delete: status = 'suspended')
 */
export async function deleteRecruiterProfile(recruiterId: string) {
  // Vérifier que le profil existe
  const existingRecruiter = await prisma.recruiter.findUnique({
    where: { id: recruiterId }
  });

  if (!existingRecruiter) {
    throw new Error('RECRUITER_NOT_FOUND');
  }

  // Soft delete: mettre le status à 'suspended'
  await prisma.recruiter.update({
    where: { id: recruiterId },
    data: { status: 'suspended' }
  });

  return { success: true };
}

/**
 * Supprimer définitivement un profil recruteur (hard delete - admin uniquement)
 */
export async function permanentlyDeleteRecruiterProfile(recruiterId: string) {
  // Vérifier que le profil existe
  const existingRecruiter = await prisma.recruiter.findUnique({
    where: { id: recruiterId }
  });

  if (!existingRecruiter) {
    throw new Error('RECRUITER_NOT_FOUND');
  }

  // Hard delete
  await prisma.recruiter.delete({
    where: { id: recruiterId }
  });

  return { success: true };
}
