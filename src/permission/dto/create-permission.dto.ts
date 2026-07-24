import { createZodDto } from "nestjs-zod";
import { z } from 'zod';

export const CreatePermissionSchema = z.object({
  code: z
    .string({ message: 'Le nom d’utilisateur est requis' })
    .min(3, 'Au moins 3 caractères')
    .max(20),
})
export class CreatePermissionDto {}
