// src/roles/dto/create-role.dto.ts
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateRoleSchema = z.object({
  nom: z
    .string({ message: 'Le nom du rôle est obligatoire.' })
    .min(2, 'Le nom du rôle doit contenir au moins 2 caractères.')
    .trim(),

  description: z.string().optional(),

  // Le front envoie un tableau de chaînes ex: ["READ_user", "CREATE_absence"]
  permissions: z
    .array(
      z.string().regex(/^[A-Z]+_[a-zA-Z]+$/, {
        message:
          'Format de permission invalide. Attendu: ACTION_cible (ex: READ_user)',
      }),
      { message: 'La liste des permissions est obligatoire.' },
    )
    .min(1, 'Vous devez attribuer au moins une permission à ce rôle.'),
});

export class CreateRoleDto extends createZodDto(CreateRoleSchema) {}
