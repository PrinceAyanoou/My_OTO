import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Enum du statut de l'année scolaire d'après le schéma Prisma

export const AnneeScolaireStatutEnum = z.enum([
  'EN_COURS',
  'EN_PREPARATION',
  'TERMINEE',
  'ARCHIVEE',
]);

// dto de création d'une année scolaire

export const CreateAnneeScolaireSchema = z
  .object({
    nom: z
      .string()
      .min(4, "Le nom de l'année scolaire doit contenir au moins 4 caractères")
      .max(50, 'Le nom ne peut pas dépasser 50 caractères'),

    dateDebut: z.iso.date({
      message: 'La date de début doit être une date valide',
    }),

    dateFin: z.iso.date({
      message: 'La date de fin doit être une date valide',
    }),

    statut: AnneeScolaireStatutEnum.default('EN_PREPARATION'),
  })
  .refine((data) => data.dateFin > data.dateDebut, {
    message:
      'La date de fin doit être strictement postérieure à la date de début',
    path: ['dateFin'],
  });

// dto de mise à jour d'une année scolaire

export const UpdateAnneeScolaireSchema = z
  .object({
    nom: z
      .string()
      .min(4, "Le nom de l'année scolaire doit contenir au moins 4 caractères")
      .max(50, 'Le nom ne peut pas dépasser 50 caractères')
      .optional(),

    dateDebut: z.iso
      .date({
        message: 'La date de début doit être une date valide',
      })
      .optional(),

    dateFin: z.iso
      .date({
        message: 'La date de fin doit être une date valide',
      })
      .optional(),

    statut: AnneeScolaireStatutEnum.optional(),
  })
  .refine(
    (data) => {
      // On vérifie les dates uniquement si les deux sont présentes
      if (data.dateDebut && data.dateFin) {
        return data.dateFin > data.dateDebut;
      }

      return true;
    },
    {
      message: 'La date de fin doit être postérieure à la date de début',
      path: ['dateFin'],
    },
  );

// dto pour le changement explicite de statut

export const ChangeStatutAnneeScolaireSchema = z.object({
  statut: AnneeScolaireStatutEnum,
});

// dto de filtrage/pagination pour la recherche

export const QueryAnneeScolaireSchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().positive().max(100).default(10),

  search: z.string().optional(),

  statut: AnneeScolaireStatutEnum.optional(),
});

// Exportation des DTOs NestJS via createZodDto

export class CreateAnneeScolaireDto extends createZodDto(
  CreateAnneeScolaireSchema,
) {}

export class UpdateAnneeScolaireDto extends createZodDto(
  UpdateAnneeScolaireSchema,
) {}

export class ChangeStatutAnneeScolaireDto extends createZodDto(
  ChangeStatutAnneeScolaireSchema,
) {}

export class QueryAnneeScolaireDto extends createZodDto(
  QueryAnneeScolaireSchema,
) {}
