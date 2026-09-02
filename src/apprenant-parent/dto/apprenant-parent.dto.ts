import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LienParenteEnum = z.enum(['PERE', 'MERE', 'TUTEUR']);

export const LinkApprenantSchema = z.object({
  apprenantId: z.uuid({
    message: "L'ID de l'apprenant doit être un UUID valide.",
  }),
  lien: LienParenteEnum.default('TUTEUR'),
});

export const UnlinkApprenantParamsSchema = z.object({
  parentId: z.uuid({ message: "L'ID du parent doit être un UUID valide." }),
  apprenantId: z.uuid({
    message: "L'ID de l'apprenant doit être un UUID valide.",
  }),
});

export class LinkApprenantDto extends createZodDto(LinkApprenantSchema) {}
export class UnlinkApprenantParamsDto extends createZodDto(
  UnlinkApprenantParamsSchema,
) {}
