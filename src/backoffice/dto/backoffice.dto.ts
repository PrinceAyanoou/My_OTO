import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  ecole_statut,
  demande_ecole_statut,
  demande_ecole_type,
  user_statut,
} from 'src/generated/prisma/client';

// Schema & DTO pour traiter une demande
export const TraiterDemandeSchema = z.object({
  statut: z
    .enum(['APPROUVEE', 'REJETEE'] as const)
    .describe('Statut final donné à la demande'),
  commentaireAdmin: z
    .string()
    .optional()
    .describe("Commentaire de l'administrateur (ex: motif de rejet)"),
});

export class TraiterDemandeDto extends createZodDto(TraiterDemandeSchema) {}

// Schema & DTO pour changer le statut d'une école
export const UpdateEcoleStatutSchema = z.object({
  statut: z.nativeEnum(ecole_statut).describe("Nouveau statut de l'école"),
});

export class UpdateEcoleStatutDto extends createZodDto(
  UpdateEcoleStatutSchema,
) {}

// Schema & DTO pour changer le statut d'un utilisateur
export const UpdateUserStatutSchema = z.object({
  statut: z.nativeEnum(user_statut).describe("Nouveau statut de l'utilisateur"),
});

export class UpdateUserStatutDto extends createZodDto(UpdateUserStatutSchema) {}

// Schema & DTO pour filtrer les demandes (Query params)
export const QueryDemandeSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1)
    .optional()
    .describe('Numéro de la page'),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .default(10)
    .optional()
    .describe('Nombre d’éléments par page'),
  statut: z
    .nativeEnum(demande_ecole_statut)
    .optional()
    .describe('Filtrer par statut de demande'),
  type: z
    .nativeEnum(demande_ecole_type)
    .optional()
    .describe('Filtrer par type de demande'),
});

export class QueryDemandeDto extends createZodDto(QueryDemandeSchema) {}

// Schema & DTO pour les listes globales (Query params)
export const QueryGlobalSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1)
    .optional()
    .describe('Numéro de la page'),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .default(10)
    .optional()
    .describe('Nombre d’éléments par page'),
  search: z.string().optional().describe('Recherche par mot-clé'),
});

export class QueryGlobalDto extends createZodDto(QueryGlobalSchema) {}
