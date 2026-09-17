import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const DossierScolariteStatutEnum = z.enum([
  'A_JOUR',
  'EN_RETARD',
  'SOLDEE',
]);

export const CreateDossierScolariteSchema = z.object({
  inscriptionApprenantId: z.uuid('ID Apprenant invalide'),
  inscriptionAnneeId: z.uuid('ID Année scolaire invalide'),
  configurationScolariteId: z.uuid('ID Configuration invalide'),
  montant: z.number().int().positive('Le montant doit être positif'),
  resteAPayer: z.number().int().min(0, 'Le reste à payer ne peut être négatif'),
  statut: DossierScolariteStatutEnum.default('A_JOUR'),
});

export class CreateDossierScolariteDto extends createZodDto(
  CreateDossierScolariteSchema,
) {}

export const UpdateDossierScolariteSchema =
  CreateDossierScolariteSchema.partial().omit({
    inscriptionApprenantId: true,
    inscriptionAnneeId: true,
  });

export class UpdateDossierScolariteDto extends createZodDto(
  UpdateDossierScolariteSchema,
) {}
