import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';

import { ConversationService } from './conversation.service';
import {
  CreateConversationDto,
  CreateMessageDto,
} from './dto/conversation.dto';

import { ClerkAuthGuard } from 'src/auth/guards/clerk-auth.guard';
import { PoliciesGuard } from 'src/auth/guards/permissions.guard';
import { CheckPolicies } from 'src/auth/decorators/check-permissions.decorator';
import { GetClerkUser } from 'src/auth/decorators/get-user.decorator';
import {
  permission_action,
  permission_cible,
} from 'src/generated/prisma/client';

@ApiTags('Conversations')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, PoliciesGuard)
@UsePipes(ZodValidationPipe)
@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies((ability) =>
    ability.can(permission_action.CREATE, permission_cible.conversation),
  )
  @ApiOperation({
    summary: 'Créer une conversation',
    description:
      'Initialise une discussion (PRIVEE ou GROUPE) avec une liste de participants.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Conversation créée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Données invalides (ex: conversation privée avec plus de 2 membres).',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Droits insuffisants pour effectuer cette action.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Un ou plusieurs participants n’existent pas.',
  })
  async create(
    @Body() dto: CreateConversationDto,
    @GetClerkUser('id') currentUserId: string,
  ) {
    return this.conversationService.create(dto, currentUserId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.conversation),
  )
  @ApiOperation({
    summary: 'Lister les conversations de l’utilisateur',
    description:
      'Récupère toutes les conversations actives de l’utilisateur pour une école donnée.',
  })
  @ApiQuery({ name: 'ecoleId', description: 'UUID de l’école contextuelle' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des conversations récupérée.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Droits insuffisants pour effectuer cette action.',
  })
  async findAllForUser(
    @Query('ecoleId', ParseUUIDPipe) ecoleId: string,
    @GetClerkUser('id') currentUserId: string,
  ) {
    return this.conversationService.findAllForUser(currentUserId, ecoleId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.conversation),
  )
  @ApiOperation({
    summary: 'Obtenir les détails d’une conversation',
    description:
      'Récupère l’historique des messages et la liste des participants.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la conversation' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conversation et messages récupérés.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'Droits insuffisants ou l’utilisateur ne fait pas partie de cette conversation.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Conversation introuvable.',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetClerkUser('id') currentUserId: string,
  ) {
    return this.conversationService.findOne(id, currentUserId);
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies((ability) =>
    ability.can(permission_action.CREATE, permission_cible.conversation),
  )
  @ApiOperation({
    summary: 'Envoyer un message',
    description: 'Ajoute un nouveau message dans la conversation.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la conversation' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Message envoyé avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données transmises invalides.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'Droits insuffisants ou l’utilisateur ne fait pas partie de la conversation.',
  })
  async sendMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMessageDto,
    @GetClerkUser('id') currentUserId: string,
  ) {
    return this.conversationService.sendMessage(id, currentUserId, dto);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.UPDATE, permission_cible.conversation),
  )
  @ApiOperation({
    summary: 'Marquer les messages comme lus',
    description:
      'Passe à true le statut `lu` de tous les messages de la conversation.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la conversation' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Messages mis à jour avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'Droits insuffisants ou l’utilisateur ne fait pas partie de la conversation.',
  })
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @GetClerkUser('id') currentUserId: string,
  ) {
    return this.conversationService.markAsRead(id, currentUserId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.DELETE, permission_cible.conversation),
  )
  @ApiOperation({
    summary: 'Supprimer une conversation',
    description: 'Supprime la conversation et ses messages associés.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la conversation' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conversation supprimée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'Droits insuffisants ou l’utilisateur ne fait pas partie de la conversation.',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetClerkUser('id') currentUserId: string,
  ) {
    return this.conversationService.remove(id, currentUserId);
  }
}
