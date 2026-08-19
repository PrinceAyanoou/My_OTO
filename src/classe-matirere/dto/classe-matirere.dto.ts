import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateClasseMatiereSchema = z.object({
  classeScolaireId: z.uuid("L'ID de la classe doit être un UUID valide."),
  matiereId: z.uuid("L'ID de la matière doit être un UUID valide."),
  uniteEnseignementId: z
    .uuid("L'ID de l'unité d'enseignement doit être un UUID valide.")
    .optional()
    .nullable(),
  coefficient: z
    .number({ message: 'Le coefficient est requis.' })
    .int('Le coefficient doit être un nombre entier.')
    .positive('Le coefficient doit être strictement supérieur à 0.'),
});

export const UpdateClasseMatiereSchema = CreateClasseMatiereSchema.partial();

export const ClasseMatiereQuerySchema = z.object({
  classeScolaireId: z.uuid().optional(),
  matiereId: z.uuid().optional(),
  uniteEnseignementId: z.uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export class CreateClasseMatiereDto extends createZodDto(
  CreateClasseMatiereSchema,
) {}
export class UpdateClasseMatiereDto extends createZodDto(
  UpdateClasseMatiereSchema,
) {}
export class ClasseMatiereQueryDto extends createZodDto(
  ClasseMatiereQuerySchema,
) {}
