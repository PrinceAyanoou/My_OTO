import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

//Schéma de création d'un bulletin
export const CreateBulletinSchema = z.object({
  inscriptionApprenantId: z.uuid(),

  inscriptionAnneeId: z.uuid(),

  periodeScolaireId: z.uuid(),

  appreciation: z.string().trim().max(1000).optional(),

  decisionFinAnnee: z.enum(['ADMIS', 'REDOUBLE', 'EXCLU', 'TRANSFERE']),
});

//Schéma de modification
export const UpdateBulletinSchema = CreateBulletinSchema.pick({
  appreciation: true,
  decisionFinAnnee: true,
}).partial();

//Schéma pour la génération du PDF
export const GenerateBulletinPdfSchema = z.object({
  inscriptionApprenantId: z.uuid(),

  inscriptionAnneeId: z.uuid(),

  periodeScolaireId: z.uuid(),
});

export class CreateBulletinDto extends createZodDto(CreateBulletinSchema) {}
export class UpdateBulletinDto extends createZodDto(UpdateBulletinSchema) {}
export class GenerateBulletinPdfDto extends createZodDto(
  GenerateBulletinPdfSchema,
) {}
