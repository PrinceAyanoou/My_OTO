import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const PolitiqueMethodeCalculEnum = z.enum([
  'MOYENNE_SIMPLE',
  'MOYENNE_PONDEREE',
]);

export const PolitiqueMethodeArrondiEnum = z.enum([
  'AUCUN',
  'ENTIER',
  'DIXIEME',
  'CENTIEME',
]);

export const CreatePolitiqueEvaluationSchema = z.object({
  nom: z
    .string({
      message: 'Le nom de la politique est requis.',
    })
    .trim()
    .min(2, 'Le nom de la politique doit contenir au moins 2 caractères.')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères.'),

  anneeScolaireId: z.uuid("L'ID de l'année scolaire doit être un UUID valide."),

  classeScolaireId: z
    .uuid("L'ID de la classe scolaire doit être un UUID valide.")
    .optional(),

  methodeCalcul: PolitiqueMethodeCalculEnum.default('MOYENNE_PONDEREE'),

  methodeArrondi: PolitiqueMethodeArrondiEnum.default('CENTIEME'),

  afficherRang: z.boolean().default(true),

  estActive: z.boolean().default(true),
});

// Schéma de mise à jour partielle (exclut anneeScolaireId qui ne change pas)
export const UpdatePolitiqueEvaluationSchema =
  CreatePolitiqueEvaluationSchema.omit({
    anneeScolaireId: true,
  }).partial();

export class CreatePolitiqueEvaluationDto extends createZodDto(
  CreatePolitiqueEvaluationSchema,
) {}

export class UpdatePolitiqueEvaluationDto extends createZodDto(
  UpdatePolitiqueEvaluationSchema,
) {}
