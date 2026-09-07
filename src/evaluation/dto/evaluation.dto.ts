import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateEvaluationSchema = z.object({
  titre: z
    .string({ message: 'Le titre est requis.' })
    .min(2, 'Le titre doit contenir au moins 2 caractères.')
    .trim(),
  date: z.iso.date({ message: "La date de l'évaluation est requise." }),
  affectationId: z.uuid("L'ID de l'affectation doit être un UUID valide."),
  typeEvaluationId: z.uuid(
    "L'ID du type d'évaluation doit être un UUID valide.",
  ),
  periodeScolaireId: z.uuid(
    "L'ID de la période scolaire doit être un UUID valide.",
  ),
});

export const UpdateEvaluationSchema = CreateEvaluationSchema.partial();

export class CreateEvaluationDto extends createZodDto(CreateEvaluationSchema) {}
export class UpdateEvaluationDto extends createZodDto(UpdateEvaluationSchema) {}
