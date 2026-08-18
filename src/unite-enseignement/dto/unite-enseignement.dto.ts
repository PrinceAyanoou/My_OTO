import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const matiereUeItemSchema = z.object({
  matiereId: z.uuid('ID de matière invalide'),
  coefficient: z
    .number({ message: 'Le coefficient de la matière est requis' })
    .int('Le coefficient doit être un entier')
    .positive('Le coefficient doit être strictement supérieur à 0'),
});

export const createUniteEnseignementSchema = z.object({
  nom: z
    .string({ message: "Le nom de l'UE est requis" })
    .min(1, 'Le nom ne peut pas être vide')
    .describe("Nom de l'unité d'enseignement"),

  code: z
    .string({ message: "Le code de l'UE est requis" })
    .min(1, 'Le code ne peut pas être vide')
    .describe("Code identifiant l'UE au sein de l'école"),
  matieres: z
    .array(matiereUeItemSchema)
    .min(1, "Une unité d'enseignement doit contenir au moins une matière")
    .describe("Matières rattachées à l'UE avec leurs coefficients"),
});

export const updateUniteEnseignementSchema =
  createUniteEnseignementSchema.partial();

export const queryUniteEnseignementSchema = z.object({
  search: z.string().optional(),
});

export class CreateUniteEnseignementDto extends createZodDto(
  createUniteEnseignementSchema,
) {}

export class UpdateUniteEnseignementDto extends createZodDto(
  updateUniteEnseignementSchema,
) {}

export class QueryUniteEnseignementDto extends createZodDto(
  queryUniteEnseignementSchema,
) {}
