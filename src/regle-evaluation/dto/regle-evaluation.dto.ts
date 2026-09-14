import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateRegleEvaluationSchema = z.object({
  politiqueId: z.uuid(
    "L'ID de la politique d'évaluation doit être un UUID valide.",
  ),

  typeEvaluationId: z.uuid(
    "L'ID du type d'évaluation doit être un UUID valide.",
  ),

  nombreMin: z.coerce
    .number({ message: 'Le nombre minimum doit être un nombre.' })
    .int('Le nombre minimum doit être un entier.')
    .min(0, 'Le nombre minimum doit être supérieur ou égal à 0.')
    .default(0),

  coefficientType: z.coerce
    .number({ message: 'Le coefficient doit être un nombre.' })
    .int('Le coefficient doit être un entier.')
    .positive('Le coefficient doit être strictement supérieur à 0.')
    .default(1),
});

// Schéma de mise à jour partielle
export const UpdateRegleEvaluationSchema = CreateRegleEvaluationSchema.pick({
  nombreMin: true,
  coefficientType: true,
}).partial();

export class CreateRegleEvaluationDto extends createZodDto(
  CreateRegleEvaluationSchema,
) {}

export class UpdateRegleEvaluationDto extends createZodDto(
  UpdateRegleEvaluationSchema,
) {}
