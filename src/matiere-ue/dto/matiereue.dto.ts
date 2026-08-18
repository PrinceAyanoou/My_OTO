import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
// Schéma pour ajouter une matière à une UE
export const addMatiereToUeSchema = z.object({
  matiereId: z.uuid("L'ID de la matière doit être un UUID valide."),
  coefficient: z
    .number({ message: 'Le coefficient est requis.' })
    .int('Le coefficient doit être un entier.')
    .positive('Le coefficient doit être strictement supérieur à 0.'),
});

// Schéma pour mettre à jour le coefficient d'une matière dans une UE
export const updateMatiereCoefficientSchema = z.object({
  coefficient: z
    .number({ message: 'Le coefficient est requis.' })
    .int('Le coefficient doit être un entier.')
    .positive('Le coefficient doit être strictement supérieur à 0.'),
});

export class AddMatiereToUeDto extends createZodDto(addMatiereToUeSchema) {}
export class UpdateMatiereCoefficientDto extends createZodDto(
  updateMatiereCoefficientSchema,
) {}
