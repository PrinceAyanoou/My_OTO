import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CiblePublicEnum = z.enum([
  'TOUS',
  'EMPLOYE',
  'PARENT',
  'APPRENANT',
]);

export const CreateCibleAnnonceSchema = z.object({
  public: CiblePublicEnum,
  classeScolaireId: z
    .uuid({ message: "L'ID de la classe doit être un UUID valide." })
    .optional()
    .nullable(),
});

export const CreateAnnonceSchema = z.object({
  titre: z
    .string({ message: 'Le titre est requis.' })
    .min(3, { message: 'Le titre doit contenir au moins 3 caractères.' })
    .max(150, { message: 'Le titre ne peut pas dépasser 150 caractères.' }),
  contenu: z
    .string({ message: 'Le contenu est requis.' })
    .min(5, { message: 'Le contenu doit contenir au moins 5 caractères.' }),
  dateExpiration: z.iso.date().optional(),
  auteurId: z.uuid({ message: "L'ID de l'auteur doit être un UUID valide." }),
  cibles: z
    .array(CreateCibleAnnonceSchema)
    .min(1, { message: 'Au moins une cible doit être spécifiée.' }),
});

export const UpdateAnnonceSchema = CreateAnnonceSchema.partial().omit({
  auteurId: true,
});

export class CreateAnnonceDto extends createZodDto(CreateAnnonceSchema) {}
export class UpdateAnnonceDto extends createZodDto(UpdateAnnonceSchema) {}
