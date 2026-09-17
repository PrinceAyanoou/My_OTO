import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// 1. Schémas isolés par rôle
const EmployeSchema = z.object({
  role: z.literal('EMPLOYE'),
  userId: z.string().uuid('ID utilisateur invalide'),
  matricule: z.string().min(1, 'Le matricule est requis'),
  dateEmbauche: z.coerce
    .date()
    .optional()
    .default(() => new Date()),
  ecoleId: z.string().uuid('ID école invalide').optional(),
});

const ParentSchema = z.object({
  role: z.literal('PARENT'),
  userId: z.string().uuid('ID utilisateur invalide'),
  profession: z.string().min(1, 'La profession est requise'),
});

const ApprenantSchema = z.object({
  role: z.literal('APPRENANT'),
  userId: z.string().uuid('ID utilisateur invalide'),
  matricule: z.string().min(1, 'Le matricule est requis'),
  nom: z.string().min(1, 'Le nom est requis'),
  prenoms: z.string().min(1, 'Le prénom est requis'),
  sexe: z.enum(['MASCULIN', 'FEMININ']),
  dateNaissance: z.coerce.date(),
});

// 2. Classes DTO pour NestJS
export class CreateEmployeDto extends createZodDto(EmployeSchema) {}
export class CreateParentDto extends createZodDto(ParentSchema) {}
export class CreateApprenantDto extends createZodDto(ApprenantSchema) {}

// 3. Type union exporté pour le Service & Contrôleur
export type AffecterMembreDto =
  CreateEmployeDto | CreateParentDto | CreateApprenantDto;
