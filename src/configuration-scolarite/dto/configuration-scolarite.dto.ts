import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateConfigurationScolariteSchema = z.object({
  nom: z
    .string({ message: 'Le nom de la configuration est requis.' })
    .min(3, 'Le nom doit contenir au moins 3 caractères.')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères.'),
  niveauScolaireId: z.uuid("L'ID du niveau scolaire doit être un UUID valide."),
  anneeScolaireId: z.uuid("L'ID de l'année scolaire doit être un UUID valide."),
  estActive: z.boolean().optional().default(true),
});

export const UpdateConfigurationScolariteSchema =
  CreateConfigurationScolariteSchema.partial();

export const ConfigurationScolariteQuerySchema = z.object({
  niveauScolaireId: z.uuid().optional(),
  anneeScolaireId: z.uuid().optional(),
  estActive: z
    .preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    }, z.boolean())
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export class CreateConfigurationScolariteDto extends createZodDto(
  CreateConfigurationScolariteSchema,
) {}

export class UpdateConfigurationScolariteDto extends createZodDto(
  UpdateConfigurationScolariteSchema,
) {}

export class ConfigurationScolariteQueryDto extends createZodDto(
  ConfigurationScolariteQuerySchema,
) {}
