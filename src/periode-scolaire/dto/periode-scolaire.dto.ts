import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { periodescolaire_statut } from 'src/generated/prisma/client';

// Enum du statut de la période scolaire d'après Prisma
export const PeriodeScolaireStatutEnum = z.enum(periodescolaire_statut);

// DTO de création d'une période scolaire
export const CreatePeriodeScolaireSchema = z
  .object({
    nom: z
      .string()
      .min(2, 'Le nom de la période doit contenir au moins 2 caractères')
      .max(50, 'Le nom ne peut pas dépasser 50 caractères'),

    ordre: z.coerce
      .number({
        message: "L'ordre doit être un nombre",
      })
      .int("L'ordre doit être un nombre entier")
      .positive("L'ordre doit être un nombre positif"),

    dateDebut: z.iso.date({
      message: 'La date de début doit être une date ISO valide',
    }),

    dateFin: z.iso.date({
      message: 'La date de fin doit être une date ISO valide',
    }),

    statut: PeriodeScolaireStatutEnum.default(
      periodescolaire_statut.NON_COMMENCEE,
    ),
  })
  .refine((data) => data.dateFin > data.dateDebut, {
    message:
      'La date de fin doit être strictement postérieure à la date de début',
    path: ['dateFin'],
  });

// DTO de mise à jour d'une période scolaire
export const UpdatePeriodeScolaireSchema = z
  .object({
    nom: z
      .string()
      .min(2, 'Le nom de la période doit contenir au moins 2 caractères')
      .max(50, 'Le nom ne peut pas dépasser 50 caractères')
      .optional(),

    ordre: z.coerce
      .number()
      .int("L'ordre doit être un nombre entier")
      .positive("L'ordre doit être un nombre positif")
      .optional(),

    dateDebut: z.iso
      .date({
        message: 'La date de début doit être une date ISO valide',
      })
      .optional(),

    dateFin: z.iso
      .date({
        message: 'La date de fin doit être une date ISO valide',
      })
      .optional(),

    statut: PeriodeScolaireStatutEnum.optional(),
  })
  .refine(
    (data) => {
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

// DTO pour le changement explicite de statut
export const ChangeStatutPeriodeSchema = z.object({
  statut: PeriodeScolaireStatutEnum,
});

// DTO de filtrage/pagination pour la recherche
export const QueryPeriodeScolaireSchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().positive().max(100).default(10),

  search: z.string().optional(),

  statut: PeriodeScolaireStatutEnum.optional(),
});

// Exportation des DTOs NestJS via createZodDto
export class CreatePeriodeScolaireDto extends createZodDto(
  CreatePeriodeScolaireSchema,
) {}

export class UpdatePeriodeScolaireDto extends createZodDto(
  UpdatePeriodeScolaireSchema,
) {}

export class ChangeStatutPeriodeDto extends createZodDto(
  ChangeStatutPeriodeSchema,
) {}

export class QueryPeriodeScolaireDto extends createZodDto(
  QueryPeriodeScolaireSchema,
) {}
