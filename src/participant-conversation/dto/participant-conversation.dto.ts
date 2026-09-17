import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RoleParticipantEnum = z.enum(['ADMIN', 'MEMBRE']);

// Base Schema
export const ParticipantConversationSchema = z.object({
  id: z.uuid(),
  conversationId: z.uuid('ID Conversation invalide'),
  userId: z.uuid('ID Utilisateur invalide'),
  role: RoleParticipantEnum.default('MEMBRE'),
  joinedAt: z.iso.date(),
});

// Ajouter un ou plusieurs participants à une conversation
export const AddParticipantsSchema = z.object({
  userIds: z
    .array(z.uuid('Chaque ID utilisateur doit être un UUID valide'))
    .min(1, 'Veuillez fournir au moins un utilisateur à ajouter'),
  role: RoleParticipantEnum.optional().default('MEMBRE'),
});

// Modifier le rôle d'un participant
export const UpdateParticipantRoleSchema = z.object({
  role: RoleParticipantEnum,
});

// Classes DTO NestJS
export class AddParticipantsDto extends createZodDto(AddParticipantsSchema) {}
export class UpdateParticipantRoleDto extends createZodDto(
  UpdateParticipantRoleSchema,
) {}
