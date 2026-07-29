import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const UserRoleTypeEnum = z.enum([
  'APPRENANT',
  'EMPLOYE',
  'PARENT',
  'TOUS',
]);
export type UserRoleType = z.infer<typeof UserRoleTypeEnum>;

export const FilterUserSchema = z.object({
  // Filtre par type de profil
  type: UserRoleTypeEnum.optional().default('TOUS'),

  // Filtre de recherche textuelle (nom, prénom ou email)
  search: z.string().optional(),
});

export class FilterUserDto extends createZodDto(FilterUserSchema) {}
