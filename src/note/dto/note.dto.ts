import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// ==========================================
// SCHÉMAS ZOD
// ==========================================

export const CreateNoteSchema = z.object({
  Valeur: z.coerce
    .number({
      message: 'La note doit être un nombre.',
    })
    .min(0, 'La note ne peut pas être négative.'),

  Observation: z
    .string()
    .trim()
    .max(255, 'L’observation ne doit pas dépasser 255 caractères.')
    .optional(),

  noteSur: z.coerce
    .number({
      message: 'Le barème doit être un nombre.',
    })
    .int('Le barème doit être un entier.')
    .positive('Le barème doit être strictement supérieur à 0.')
    .default(20),

  evaluationId: z.uuid("L'ID de l'évaluation doit être un UUID valide."),

  inscriptionApprenantId: z.uuid("L'ID de l'élève doit être un UUID valide."),

  inscriptionAnneeId: z.uuid(
    "L'ID de l'année scolaire doit être un UUID valide.",
  ),
});

// Schéma de mise à jour partielle
export const UpdateNoteSchema = CreateNoteSchema.pick({
  Valeur: true,
  Observation: true,
  noteSur: true,
}).partial();

export class CreateNoteDto extends createZodDto(CreateNoteSchema) {}
export class UpdateNoteDto extends createZodDto(UpdateNoteSchema) {}
