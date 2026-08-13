import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ApprenantParentLienEnum = z.enum(['PERE', 'MERE', 'TUTEUR']);

//Création d'un Parent et de son compte User/Clerk
export const CreateParentWithUserSchema = z.object({
  // Informations Utilisateur (User)
  nom: z
    .string()
    .min(3, 'Le nom est requis')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  prenoms: z
    .string()
    .min(3, 'Le prénom est requis')
    .max(150, 'Le prénom ne peut pas dépasser 150 caractères'),
  email: z.email("Format d'email invalide").toLowerCase(),
  telephone: z
    .string()
    .min(10, 'Le numéro de téléphone doit contenir au moins 10 chiffres'),

  // Informations Parent
  profession: z.string().min(3, 'La profession est requise'),

  // Association initiale optionnelle d'apprenants.
  apprenants: z
    .array(
      z.object({
        apprenantId: z.uuid("L'ID de l'apprenant doit être un UUID valide"),
        lien: ApprenantParentLienEnum,
      }),
    )
    .optional(),
});

//Mise à jour des informations du Parent
export const UpdateParentSchema = z.object({
  profession: z.string().min(2).optional(),
});

//Liaison d'un enfant (Apprenant) à un Parent
export const LinkApprenantSchema = z.object({
  apprenantId: z.string().uuid("L'ID de l'apprenant doit être un UUID valide"),
  lien: ApprenantParentLienEnum,
});

//Filtres et Pagination pour la recherche des parents
export const QueryParentSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
});

export class CreateParentWithUserDto extends createZodDto(
  CreateParentWithUserSchema,
) {}
export class UpdateParentDto extends createZodDto(UpdateParentSchema) {}
export class LinkApprenantDto extends createZodDto(LinkApprenantSchema) {}
export class QueryParentDto extends createZodDto(QueryParentSchema) {}
