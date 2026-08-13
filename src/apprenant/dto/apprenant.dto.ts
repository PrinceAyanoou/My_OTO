import { z } from 'zod';

export const ApprenantSexeEnum = z.enum(['MASCULIN', 'FEMININ']);
export const ApprenantParentLienEnum = z.enum(['PERE', 'MERE', 'TUTEUR']);

//dto pour créer un apprenant
export const CreateApprenantSchema = z.object({
  nom: z
    .string()
    .min(3, 'Le nom est requis')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  prenoms: z
    .string()
    .min(3, 'Le prénom est requis')
    .max(150, 'Le prénom ne peut pas dépasser 150 caractères'),
  sexe: ApprenantSexeEnum,
  dateNaissance: z.coerce.date({
    message: 'Date de naissance invalide',
  }),

  // Optionnel : Créer et associer un compte utilisateur
  createUserAccount: z.boolean().default(false).optional(),
  email: z.email("Format d'email invalide").toLowerCase().optional(),
  telephone: z.string().optional(),

  // Optionnel : Association initiale de parents existants
  parents: z
    .array(
      z.object({
        parentId: z.string().uuid("L'ID du parent doit être un UUID valide"),
        lien: ApprenantParentLienEnum,
      }),
    )
    .optional(),
});

//dto pour mettre à jour les informations d'un apprenant.
export const UpdateApprenantSchema = z.object({
  nom: z.string().min(2).max(100).optional(),
  prenoms: z.string().min(2).max(150).optional(),
  sexe: ApprenantSexeEnum.optional(),
  dateNaissance: z.coerce.date().optional(),
});

//dto pour filtrer et paginer les apprenants
export const QueryApprenantSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  sexe: ApprenantSexeEnum.optional(),
  classeId: z.string().uuid().optional(),
  anneeScolaireId: z.string().uuid().optional(),
});

export type CreateApprenantDto = z.infer<typeof CreateApprenantSchema>;
export type UpdateApprenantDto = z.infer<typeof UpdateApprenantSchema>;
export type QueryApprenantDto = z.infer<typeof QueryApprenantSchema>;
