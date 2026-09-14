import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Création d'une ligne de bulletin
 *
 * Le coefficient n'est volontairement pas demandé.
 * Il sera récupéré depuis classematirere.
 */
export const CreateLigneBulletinSchema = z.object({
  bulletinApprenantId: z.uuid(),
  bulletinAnneeId: z.uuid(),
  bulletinId: z.uuid(),

  matiereId: z.uuid(),

  moyenne: z
    .number()
    .min(0, 'La moyenne ne peut pas être négative')
    .max(20, 'La moyenne ne peut pas dépasser 20'),
});

export class CreateLigneBulletinDto extends createZodDto(
  CreateLigneBulletinSchema,
) {}

/**
 * Modification d'une ligne de bulletin
 */
export const UpdateLigneBulletinSchema = CreateLigneBulletinSchema.partial();

export class UpdateLigneBulletinDto extends createZodDto(
  UpdateLigneBulletinSchema,
) {}
