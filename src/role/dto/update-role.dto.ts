// src/roles/dto/update-role.dto.ts
import { createZodDto } from 'nestjs-zod';
import { CreateRoleSchema } from './create-role.dto';

// Rend tous les champs du CreateRoleSchema optionnels
export const UpdateRoleSchema = CreateRoleSchema.partial();

export class UpdateRoleDto extends createZodDto(UpdateRoleSchema) {}
