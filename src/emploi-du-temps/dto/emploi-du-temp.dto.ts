import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const CreateEmploiDuTempsSchema = z.object({
  affectationEnseignantId: z.uuid('ID affectation invalide'),
  jourDeLaSemaine: z.enum([
    'LUNDI',
    'MARDI',
    'MERCREDI',
    'JEUDI',
    'VENDREDI',
    'SAMEDI',
    'DIMANCHE',
  ]),
  heureDebut: z.string().regex(TIME_REGEX, 'Format attendu HH:mm'),
  heureFin: z.string().regex(TIME_REGEX, 'Format attendu HH:mm'),
  classeScolaireId: z.uuid('ID classe invalide'),
});

export const UpdateEmploiDuTempsSchema = CreateEmploiDuTempsSchema.partial();

export const QueryEmploiDuTempsSchema = z.object({
  classeScolaireId: z.uuid().optional(),
  affectationEnseignantId: z.uuid().optional(),
  jourDeLaSemaine: z
    .enum([
      'LUNDI',
      'MARDI',
      'MERCREDI',
      'JEUDI',
      'VENDREDI',
      'SAMEDI',
      'DIMANCHE',
    ])
    .optional(),
});

export class CreateEmploiDuTempsDto extends createZodDto(
  CreateEmploiDuTempsSchema,
) {}

export class UpdateEmploiDuTempsDto extends createZodDto(
  UpdateEmploiDuTempsSchema,
) {}

export class QueryEmploiDuTempsDto extends createZodDto(
  QueryEmploiDuTempsSchema,
) {}
