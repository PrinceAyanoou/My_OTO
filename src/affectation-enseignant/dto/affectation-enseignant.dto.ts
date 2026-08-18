import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateAffectationEnseignantSchema = z.object({
  employeId: z.uuid({ message: "L'ID de l'employé doit être un UUID valide." }),

  classeScolaireId: z.uuid({
    message: "L'ID de la classe scolaire doit être un UUID valide.",
  }),

  matiereId: z.uuid({
    message: "L'ID de la matière doit être un UUID valide.",
  }),

  anneeScolaireId: z.uuid({
    message: "L'ID de l'année scolaire doit être un UUID valide.",
  }),
});

export const UpdateAffectationEnseignantSchema =
  CreateAffectationEnseignantSchema.partial();

export const AffectationEnseignantQuerySchema = z.object({
  employeId: z
    .uuid({ message: "L'ID de l'employé doit être un UUID valide." })
    .optional(),
  classeScolaireId: z
    .uuid({ message: "L'ID de la classe scolaire doit être un UUID valide." })
    .optional(),
  matiereId: z
    .uuid({ message: "L'ID de la matière doit être un UUID valide." })
    .optional(),
  anneeScolaireId: z
    .uuid({ message: "L'ID de l'année scolaire doit être un UUID valide." })
    .optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
});

export class CreateAffectationEnseignantDto extends createZodDto(
  CreateAffectationEnseignantSchema,
) {}

export class UpdateAffectationEnseignantDto extends createZodDto(
  UpdateAffectationEnseignantSchema,
) {}

export class AffectationEnseignantQueryDto extends createZodDto(
  AffectationEnseignantQuerySchema,
) {}
