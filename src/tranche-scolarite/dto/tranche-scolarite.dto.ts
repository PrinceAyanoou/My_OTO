import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateTrancheScolariteSchema = z.object({
  nom: z
    .string()
    .min(1, 'Le nom de la tranche est obligatoire')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),

  montant: z
    .number()
    .int('Le montant doit être un nombre entier')
    .positive('Le montant doit être supérieur à 0'),

  dateEcheance: z.iso.date({
    error: "La date d'échéance est invalide",
  }),

  ordre: z
    .number()
    .int("L'ordre doit être un nombre entier")
    .positive("L'ordre doit être supérieur à 0"),
});

export class CreateTrancheScolariteDto extends createZodDto(
  CreateTrancheScolariteSchema,
) {}

export const UpdateTrancheScolariteSchema =
  CreateTrancheScolariteSchema.partial();

export class UpdateTrancheScolariteDto extends createZodDto(
  UpdateTrancheScolariteSchema,
) {}
