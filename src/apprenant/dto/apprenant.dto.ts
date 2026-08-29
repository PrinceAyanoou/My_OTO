import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * ============================================================
 * ENUMS
 * ============================================================
 */

const SexeSchema = z.enum(['MASCULIN', 'FEMININ']);

const TypeInscriptionSchema = z.enum([
  'INSCRIPTION',
  'REINSCRIPTION',
  'TRANSFERT_EN_COURS_D_ANNEE',
]);

export const CreateApprenantSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(3, 'Le nom est obligatoire.')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères.'),

  prenoms: z
    .string()
    .trim()
    .min(3, 'Les prénoms sont obligatoires.')
    .max(150, 'Les prénoms ne doivent pas dépasser 150 caractères.'),

  Sexe: SexeSchema,

  dateNaissance: z.iso.date({
    error: 'La date de naissance doit être au format YYYY-MM-DD.',
  }),

  matricule: z
    .string()
    .trim()
    .min(1, 'Le matricule est obligatoire.')
    .max(50, 'Le matricule ne doit pas dépasser 50 caractères.'),

  email: z
    .email({
      error: "L'adresse email est invalide.",
    })
    .optional(),

  anneeScolaireId: z.uuid('L’identifiant de l’année scolaire est invalide.'),

  classeScolaireId: z.uuid('L’identifiant de la classe scolaire est invalide.'),

  configuartionScolariteId: z.uuid(
    'L’identifiant de la configuration scolaire est invalide.',
  ),
  telephone: z
    .string()
    .min(10, 'Le numéro de téléphone doit contenir au moins 10 chiffres'),

  type: TypeInscriptionSchema,
});

export class CreateApprenantDto extends createZodDto(CreateApprenantSchema) {}

export const UpdateApprenantSchema = z.object({
  nom: z.string().trim().min(1).max(100).optional(),

  prenoms: z.string().trim().min(1).max(150).optional(),

  Sexe: SexeSchema.optional(),

  dateNaissance: z.iso
    .date({
      error: 'La date doit être au format YYYY-MM-DD.',
    })
    .optional(),

  matricule: z.string().trim().min(1).max(50).optional(),

  email: z
    .email({
      error: "L'adresse email est invalide.",
    })
    .optional(),
});

export class UpdateApprenantDto extends createZodDto(UpdateApprenantSchema) {}

export const QueryApprenantSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  search: z.string().trim().min(1).optional(),

  matricule: z.string().trim().optional(),

  sexe: SexeSchema.optional(),

  anneeScolaireId: z.uuid().optional(),

  classeScolaireId: z.uuid().optional(),

  userId: z.uuid().optional(),
});

export class QueryApprenantDto extends createZodDto(QueryApprenantSchema) {}
