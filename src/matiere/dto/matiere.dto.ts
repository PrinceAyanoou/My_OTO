import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createMatiereSchema = z.object({
  nom: z
    .string({ message: 'Le nom de la matière est requis' })
    .min(1, 'Le nom ne peut pas être vide')
    .describe('Nom de la matière (ex: Mathématiques, Histoire-Géo)'),

  CodeMat: z
    .string({ message: 'Le code de la matière est requis' })
    .min(1, 'Le code ne peut pas être vide')
    .describe(
      'Code identifiant la matière (ex: MATH pour mathématique, Fr pour français, etc...)',
    ),

  description: z
    .string()
    .optional()
    .describe('Description détaillée de la matière'),
});

export const updateMatiereSchema = createMatiereSchema.partial();

export const queryMatiereSchema = z.object({
  search: z
    .string()
    .optional()
    .describe('Filtrer les matières par nom ou par code'),
});

export class CreateMatiereDto extends createZodDto(createMatiereSchema) {}
export class UpdateMatiereDto extends createZodDto(updateMatiereSchema) {}
export class QueryMatiereDto extends createZodDto(queryMatiereSchema) {}
