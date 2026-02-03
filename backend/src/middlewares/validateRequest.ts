import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware de validation des requêtes avec Zod
 * @param schema - Schéma Zod à utiliser pour la validation
 * @returns Middleware Express
 */
export function validateRequest(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Valider le body de la requête
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formater les erreurs Zod en réponse lisible
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json({
          error: 'Validation échouée',
          code: 'VALIDATION_ERROR',
          details: errors
        });
      }

      // Erreur inattendue
      next(error);
    }
  };
}
