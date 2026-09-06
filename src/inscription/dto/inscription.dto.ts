import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const InscriptionTypeEnum = z.enum([
  'INSCRIPTION',
  'REINSCRIPTION',
  'TRANSFERT_EN_COURS_D_ANNEE',
]);

export const ChangeClasseSchema = z.object({
  nouvelleClasseId: z.uuid({ message: 'UUID invalide pour la classe.' }),
  motif: z
    .string()
    .min(3, { message: 'Le motif du changement est requis.' })
    .optional(),
});

export const CreateInscriptionSchema = z.object({
  type: InscriptionTypeEnum,
  apprenantId: z.uuid(),
  anneeScolaireId: z.uuid(),
  classeScolaireId: z.uuid(),
  configuartionScolariteId: z.uuid(),
  matricule: z.string().optional().nullable(),
  dateInscription: z.iso.datetime().optional(),
});

export const UpdateInscriptionSchema = CreateInscriptionSchema.partial().omit({
  apprenantId: true,
  anneeScolaireId: true,
});

export class CreateInscriptionDto extends createZodDto(
  CreateInscriptionSchema,
) {}
export class UpdateInscriptionDto extends createZodDto(
  UpdateInscriptionSchema,
) {}
export class ChangeClasseDto extends createZodDto(ChangeClasseSchema) {}
