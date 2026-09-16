import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ConversationService } from './conversation.service';
import {
  CreateConversationDto,
  CreateMessageDto,
} from './dto/conversation.dto';

@ApiTags('Conversations')
@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
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
    status: HttpStatus.NOT_FOUND,
    description: 'Un ou plusieurs participants n’existent pas.',
  })
  async create(
    @Body() dto: CreateConversationDto,
    // TODO: Remplacer @Query par le décorateur custom qui récupère l'id de l'user connecté.
    @Query('currentUserId', ParseUUIDPipe) currentUserId: string,
  ) {
    return this.conversationService.create(dto, currentUserId);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les conversations de l’utilisateur',
    description:
      'Récupère toutes les conversations actives de l’utilisateur pour une école donnée.',
  })
  @ApiQuery({ name: 'ecoleId', description: 'UUID de l’école contextuelle' })
  @ApiQuery({
    name: 'currentUserId',
    description: 'UUID de l’utilisateur connecté',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des conversations récupérée.',
  })
  async findAllForUser(
    @Query('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Query('currentUserId', ParseUUIDPipe) currentUserId: string,
  ) {
    return this.conversationService.findAllForUser(currentUserId, ecoleId);
  }

  @Get(':id')
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
    status: HttpStatus.FORBIDDEN,
    description: 'Accès non autorisé à cette conversation.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Conversation introuvable.',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('currentUserId', ParseUUIDPipe) currentUserId: string,
  ) {
    return this.conversationService.findOne(id, currentUserId);
  }

  @Post(':id/messages')
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
    status: HttpStatus.FORBIDDEN,
    description: 'L’utilisateur ne fait pas partie de la conversation.',
  })
  async sendMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMessageDto,
    @Query('currentUserId', ParseUUIDPipe) currentUserId: string,
  ) {
    return this.conversationService.sendMessage(id, currentUserId, dto);
  }

  @Patch(':id/read')
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
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('currentUserId', ParseUUIDPipe) currentUserId: string,
  ) {
    return this.conversationService.markAsRead(id, currentUserId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer une conversation',
    description: 'Supprime la conversation et ses messages associés.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la conversation' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conversation supprimée avec succès.',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('currentUserId', ParseUUIDPipe) currentUserId: string,
  ) {
    return this.conversationService.remove(id, currentUserId);
  }
}
