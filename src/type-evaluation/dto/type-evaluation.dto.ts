import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateTypeEvaluationSchema = z.object({
  nom: z
    .string({ message: 'Le nom du type d’évaluation est requis.' })
    .min(2, 'Le nom doit contenir au moins 2 caractères.')
    .trim(),
});

export const UpdateTypeEvaluationSchema = CreateTypeEvaluationSchema.partial();

export class CreateTypeEvaluationDto extends createZodDto(
  CreateTypeEvaluationSchema,
) {}

export class UpdateTypeEvaluationDto extends createZodDto(
  UpdateTypeEvaluationSchema,
) {}
