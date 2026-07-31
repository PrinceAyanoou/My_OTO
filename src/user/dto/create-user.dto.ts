import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { user_statut } from '../../generated/prisma/client';

export const CreateUserSchema = z.object({
  nom: z
    .string({
      message: 'Le nom est requis',
    })
    .min(3, 'Le nom doit contenir au moins 3 caractères'),

  prenoms: z
    .string({
      message: 'Le prénom est requis',
    })
    .min(3, 'Le prénom doit contenir au moins 3 caractères'),

  email: z
    .string({
      message: "L'email est requis",
    })
    .email("Format d'email invalide"),

  telephone: z
    .string({
      message: 'Le numéro de téléphone est requis',
    })
    .min(10, 'Numéro de téléphone trop court'),

  statut: z.enum(user_statut).optional().default(user_statut.ACTIF),

  clerkUserId: z
    .string({
      message: "L'ID Clerk est requis.",
    })
    .startsWith('user_', {
      message: "Format d'ID Clerk invalide (doit commencer par 'user_').",
    })
    .min(25, "L'ID Clerk est trop court.")
    .max(50, "L'ID Clerk est trop long."),
});

// 2. Création de la classe DTO NestJS à partir du schéma Zod
export class CreateUserDto extends createZodDto(CreateUserSchema) {}
