import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const DownloadTemplateSchema = z.object({
  classeScolaireId: z.uuid("L'ID de la classe doit être un UUID valide."),
  evaluationId: z.uuid("L'ID de l'évaluation est requis.").optional(),
});

export const ImportNotesExcelSchema = z.object({
  evaluationId: z.uuid("L'ID de l'évaluation doit être un UUID valide."),
  noteSur: z.coerce
    .number()
    .int()
    .positive('Le barème doit être un nombre positif.')
    .default(20),
});

export class DownloadTemplateDto extends createZodDto(DownloadTemplateSchema) {}
export class ImportNotesExcelDto extends createZodDto(ImportNotesExcelSchema) {}
