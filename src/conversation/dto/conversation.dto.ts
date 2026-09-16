import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Enum du schéma Prisma
export const ConversationTypeEnum = z.enum(['PRIVEE', 'GROUPE']);

// Base Schema
export const ConversationSchema = z.object({
  id: z.uuid("le format de l'id est incorrect."),
  type: ConversationTypeEnum,
  ecoleId: z.uuid('ID École invalide'),
});

// Création d'une conversation (Privee ou Groupe)
export const CreateConversationSchema = z.object({
  type: ConversationTypeEnum,
  ecoleId: z.uuid('ID École invalide'),
  participantUserIds: z
    .array(z.uuid())
    .min(1, 'La conversation doit inclure au moins un participant'),
  premierMessage: z.string().trim().min(1).optional(),
});

// Envoi d'un message dans une conversation
export const CreateMessageSchema = z.object({
  contenu: z.string().trim().min(1, 'Le message ne peut pas être vide'),
  fichierUrl: z.string().url('URL de fichier invalide').optional(),
});

export class CreateConversationDto extends createZodDto(
  CreateConversationSchema,
) {}
export class CreateMessageDto extends createZodDto(CreateMessageSchema) {}
