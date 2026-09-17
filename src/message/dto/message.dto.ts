import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const MessageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid('ID Conversation invalide'),
  contenu: z.string().trim().min(1, 'Le message ne peut pas être vide'),
  fichierUrl: z.string().url('URL de fichier invalide').optional(),
  lu: z.boolean().default(false),
  dateEnvoi: z.date(),
});

// Envoi d'un message dans une conversation
export const CreateMessageSchema = z.object({
  contenu: z.string().trim().min(1, 'Le message ne peut pas être vide'),
  fichierUrl: z.string().url('URL de fichier invalide').optional(),
});

// Modification d'un message
export const UpdateMessageSchema = z.object({
  contenu: z.string().trim().min(1, 'Le message ne peut pas être vide'),
});

export class CreateMessageDto extends createZodDto(CreateMessageSchema) {}
export class UpdateMessageDto extends createZodDto(UpdateMessageSchema) {}
