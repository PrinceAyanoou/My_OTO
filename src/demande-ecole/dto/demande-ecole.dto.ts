import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const EcoleTypeEnum = z.enum([
  'MATERNELLE_PRIMAIRE',
  'COLLEGE_LYCEE',
  'UNIVERSITE',
]);

export const DemanderCreationSchema = z.object({
  nom: z
    .string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(150, 'Le nom ne peut pas contenir plus de 150 caractères'),
  type: EcoleTypeEnum,
  nomFondateur: z
    .string()
    .min(3, 'Le nom du fondateur est requis')
    .max(50, 'Nom trop long'),
  ville: z.string().min(3, 'La ville est requise').max(100, 'Nom trop long'),
  boitePostale: z.string().optional(),
  email: z.string().email('Adresse email invalide'),
  telephone: z.string().min(10, 'Le numéro de téléphone est invalide'),
  description: z.string().optional(),
});

export class DemanderCreationDto extends createZodDto(DemanderCreationSchema) {}

export const SchemaDonneesEcolePartial = DemanderCreationSchema.partial();

export const DemanderModificationSchema = z.object({
  ecoleId: z.string().uuid('ID école invalide').optional(),
  motif: z.string().optional(),
  donnees: SchemaDonneesEcolePartial,
});

export class DemanderModificationDto extends createZodDto(
  DemanderModificationSchema,
) {}

export const DemanderSuppressionSchema = z.object({
  ecoleId: z.string().uuid('ID école invalide').optional(),
  motif: z
    .string()
    .min(5, 'Le motif de suppression doit contenir au moins 5 caractères'),
});

export class DemanderSuppressionDto extends createZodDto(
  DemanderSuppressionSchema,
) {}
