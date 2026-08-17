import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// 1. Schemas Zod de base
export const createNiveauScolaireSchema = z.object({
  nom: z
    .string({ message: 'Le nom du niveau est requis' })
    .min(1, 'Le nom ne peut pas être vide'), // Ex: "6ième", "5ième", "Terminale"
});

export const updateNiveauScolaireSchema = createNiveauScolaireSchema.partial();

export const queryNiveauScolaireSchema = z.object({
  search: z.string().optional(),
});

// 2. Exportation sous forme de classes DTO avec createZodDto
export class CreateNiveauScolaireDto extends createZodDto(
  createNiveauScolaireSchema,
) {}
export class UpdateNiveauScolaireDto extends createZodDto(
  updateNiveauScolaireSchema,
) {}
export class QueryNiveauScolaireDto extends createZodDto(
  queryNiveauScolaireSchema,
) {}
