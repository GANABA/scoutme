import { Player } from '@prisma/client';

/**
 * Calculer l'âge à partir de la date de naissance
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  const birth = new Date(birthDate);

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Valider l'âge (13-45 ans)
 */
export function validateAge(birthDate: Date): boolean {
  const age = calculateAge(birthDate);
  return age >= 13 && age <= 45;
}

/**
 * Formater la réponse du profil joueur
 */
export function formatPlayerResponse(player: Player) {
  return {
    id: player.id,
    userId: player.userId,
    fullName: player.fullName,
    birthDate: player.birthDate.toISOString().split('T')[0], // YYYY-MM-DD
    age: calculateAge(player.birthDate),
    nationality: player.nationality,
    city: player.city,
    country: player.country,
    primaryPosition: player.primaryPosition,
    secondaryPositions: player.secondaryPositions as string[],
    strongFoot: player.strongFoot,
    heightCm: player.heightCm,
    weightKg: player.weightKg,
    currentClub: player.currentClub,
    careerHistory: player.careerHistory,
    phone: player.phone,
    profilePhotoUrl: player.profilePhotoUrl,
    videoUrls: player.videoUrls as Array<{ url: string; title?: string }>,
    status: player.status,
    createdAt: player.createdAt.toISOString(),
    updatedAt: player.updatedAt.toISOString()
  };
}
