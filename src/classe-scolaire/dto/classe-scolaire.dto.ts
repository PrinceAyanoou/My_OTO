import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Schémas Zod de base
export const createClasseScolaireSchema = z.object({
  nom: z
    .string({ message: 'Le nom de la classe est requis' })
    .min(1, 'Le nom ne peut pas être vide')
    .describe('Nom de la classe (ex: 6ième A, Terminale C)'),

  capacite: z
    .number({ message: 'La capacité doit être un nombre' })
    .int('La capacité doit être un nombre entier')
    .positive('La capacité doit être supérieure à 0')
    .optional()
    .describe("Capacité maximale d d'élèves dans la classe"),
});

export const updateClasseScolaireSchema = createClasseScolaireSchema.partial();

export const queryClasseScolaireSchema = z.object({
  search: z
    .string()
    .optional()
    .describe('Terme de recherche pour filtrer par nom de classe'),
});

// Exportation sous forme de classes DTO compatibles Swagger / NestJS
export class CreateClasseScolaireDto extends createZodDto(
  createClasseScolaireSchema,
) {}

export class UpdateClasseScolaireDto extends createZodDto(
  updateClasseScolaireSchema,
) {}

export class QueryClasseScolaireDto extends createZodDto(
  queryClasseScolaireSchema,
) {}
