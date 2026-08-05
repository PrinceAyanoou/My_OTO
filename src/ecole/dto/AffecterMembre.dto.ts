import { z } from 'zod';

export const AffecterMembreSchema = z.discriminatedUnion('role', [
  // Cas EMPLOYE
  z.object({
    role: z.literal('EMPLOYE'),
    userId: z.uuid(),
    matricule: z.string(),
    dateEmbauche: z.coerce
      .date()
      .optional()
      .default(() => new Date()),
  }),
  // Cas PARENT
  z.object({
    role: z.literal('PARENT'),
    userId: z.uuid(),
    profession: z.string(),
  }),
  // Cas APPRENANT
  z.object({
    role: z.literal('APPRENANT'),
    userId: z.uuid(),
    matricule: z.string(),
    nom: z.string(),
    prenoms: z.string(),
    sexe: z.enum(['MASCULIN', 'FEMININ']),
    dateNaissance: z.coerce.date(),
  }),
]);

export type AffecterMembreDto = z.infer<typeof AffecterMembreSchema>;
