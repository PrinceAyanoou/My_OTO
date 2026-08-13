import { z } from 'zod';

// ENUMS
export const EmployeDocumentTypeEnum = z.enum([
  'DIPLOME',
  'CONTRAT',
  'PIECE_IDENTITE',
  'JUSTIFICATIF',
]);

//DTO pour la création complète d'un employé quand son compte User/Clerk n'existe pas.
export const CreateEmployeWithUserSchema = z.object({
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

  // Informations Employé
  matricule: z
    .string()
    .min(5, 'Le matricule est requis')
    .max(50, 'Le matricule est trop long'),
  dateEmbauche: z.coerce.date({
    message: "La date d'embauche est invalide",
  }),
  ecoleId: z.uuid("l'id de l'école est requis."),

  // Assignation initiale des rôles optionnelle
  rolesIds: z.array(z.uuid('ID de rôle invalide')).optional(),
});

//DTO pour la mise à jour d'un employé.
export const UpdateEmployeSchema = z.object({
  // Informations Employé
  matricule: z.string().min(1).optional(),
  dateEmbauche: z.coerce.date().optional(),
});

//DTO pour l'ajout d'un document administratif à un employé
export const AddEmployeDocumentSchema = z.object({
  type: EmployeDocumentTypeEnum,
  titre: z.string().min(1, 'Le titre du document est requis'),
  documentUrl: z.string().url("L'URL du document doit être une URL valide"),
});

//DTO pour les filtres et la pagination (Recherche d'employés)
export const QueryEmployeSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  roleId: z.uuid().optional(),
  ecoleId: z.uuid().optional(),
});

export type CreateEmployeWithUserDto = z.infer<
  typeof CreateEmployeWithUserSchema
>;
export type UpdateEmployeDto = z.infer<typeof UpdateEmployeSchema>;
export type AddEmployeDocumentDto = z.infer<typeof AddEmployeDocumentSchema>;
export type QueryEmployeDto = z.infer<typeof QueryEmployeSchema>;
