import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

// Initialiser Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@scoutme.com';
const FROM_NAME = process.env.RESEND_FROM_NAME || 'ScoutMe';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Charge un template HTML et remplace les variables
 * @param templateName - Nom du fichier template (sans extension)
 * @param variables - Objet contenant les variables à remplacer
 * @returns HTML avec variables remplacées
 */
function loadTemplate(templateName: string, variables: Record<string, string>): string {
  const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
  let html = fs.readFileSync(templatePath, 'utf-8');

  // Remplacer toutes les variables {{variable}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, value);
  });

  return html;
}

/**
 * Envoie un email de vérification d'adresse email
 * @param email - Adresse email du destinataire
 * @param token - Token de vérification
 */
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `${FRONTEND_URL}/auth/verify-email?token=${token}`;

  const html = loadTemplate('verification-email-fr', {
    verificationUrl
  });

  try {
    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: 'Vérifiez votre email - ScoutMe',
      html
    });

    console.log(`Email de vérification envoyé à: ${email}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
    throw new Error('EMAIL_SEND_FAILED');
  }
}

/**
 * Envoie un email de réinitialisation de mot de passe
 * @param email - Adresse email du destinataire
 * @param token - Token de réinitialisation
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${token}`;

  const html = loadTemplate('password-reset-fr', {
    resetUrl
  });

  try {
    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe - ScoutMe',
      html
    });

    console.log(`Email de réinitialisation envoyé à: ${email}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
    throw new Error('EMAIL_SEND_FAILED');
  }
}

/**
 * Envoie un email de confirmation d'approbation de recruteur
 * @param email - Adresse email du recruteur
 * @param fullName - Nom complet du recruteur
 */
export async function sendRecruiterApprovalEmail(email: string, fullName: string): Promise<void> {
  // TODO: Créer template recruiter-approval-fr.html
  const loginUrl = `${FRONTEND_URL}/auth/login`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Compte Approuvé - ScoutMe</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #667eea;">✅ Votre compte recruteur est approuvé !</h1>
      <p>Bonjour ${fullName},</p>
      <p>Bonne nouvelle ! Votre compte recruteur ScoutMe a été validé par notre équipe.</p>
      <p>Vous pouvez maintenant vous connecter et commencer à rechercher des talents :</p>
      <a href="${loginUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Se connecter</a>
      <p>Bienvenue dans la communauté ScoutMe !</p>
      <p>L'équipe ScoutMe</p>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: 'Votre compte recruteur est approuvé - ScoutMe',
      html
    });

    console.log(`Email d'approbation envoyé à: ${email}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email d\'approbation:', error);
    throw new Error('EMAIL_SEND_FAILED');
  }
}

/**
 * Envoie un email de rejet de compte recruteur
 * @param email - Adresse email du recruteur
 * @param fullName - Nom complet du recruteur
 * @param reason - Raison du rejet (optionnel)
 */
export async function sendRecruiterRejectionEmail(
  email: string,
  fullName: string,
  reason?: string
): Promise<void> {
  const contactUrl = `${FRONTEND_URL}/contact`;

  const reasonText = reason ? `<p>Raison: ${reason}</p>` : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Demande de Compte - ScoutMe</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #ef4444;">Demande de compte recruteur</h1>
      <p>Bonjour ${fullName},</p>
      <p>Nous avons examiné votre demande de compte recruteur ScoutMe.</p>
      <p>Malheureusement, nous ne pouvons pas valider votre compte pour le moment.</p>
      ${reasonText}
      <p>Si vous pensez qu'il s'agit d'une erreur, <a href="${contactUrl}">contactez-nous</a>.</p>
      <p>Cordialement,<br>L'équipe ScoutMe</p>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: 'Mise à jour de votre demande de compte - ScoutMe',
      html
    });

    console.log(`Email de rejet envoyé à: ${email}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de rejet:', error);
    throw new Error('EMAIL_SEND_FAILED');
  }
}
