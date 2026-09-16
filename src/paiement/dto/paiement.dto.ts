import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const moyenPaiementSchema = z.enum(['BANQUE', 'MOBILE_MONEY', 'ESPECES'], {
  error: 'Le moyen de paiement est invalide',
});

export const CreatePaiementSchema = z.object({
  montant: z
    .number()
    .int('Le montant doit être un nombre entier')
    .positive('Le montant doit être supérieur à 0'),

  datePaiement: z.iso.date({
    error: 'La date de paiement est invalide',
  }),

  moyenPaiement: moyenPaiementSchema,

  references: z
    .string()
    .trim()
    .min(1, 'La référence ne peut pas être vide')
    .optional(),

  recuUrl: z.url('L’URL du reçu est invalide').optional(),

  dossierScolariteId: z
    .string()
    .trim()
    .min(1, 'Le dossier scolaire est obligatoire'),
});

export class CreatePaiementDto extends createZodDto(CreatePaiementSchema) {}

export const UpdatePaiementSchema = z.object({
  montant: z
    .number()
    .int('Le montant doit être un nombre entier')
    .positive('Le montant doit être supérieur à 0')
    .optional(),

  datePaiement: z.iso
    .date({
      error: 'La date de paiement est invalide',
    })
    .optional(),

  moyenPaiement: moyenPaiementSchema.optional(),

  references: z
    .string()
    .trim()
    .min(1, 'La référence ne peut pas être vide')
    .optional(),

  recuUrl: z.url('L’URL du reçu est invalide').optional(),
});

export class UpdatePaiementDto extends createZodDto(UpdatePaiementSchema) {}
