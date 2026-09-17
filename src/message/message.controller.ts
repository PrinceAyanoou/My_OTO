import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MessageService } from './message.service';
import { CreateMessageDto, UpdateMessageDto } from './dto/message.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';
import { CheckPolicies } from '../auth/decorators/check-permissions.decorator';
import { GetClerkUser } from '../auth/decorators/get-user.decorator';
import {
  permission_action,
  permission_cible,
} from 'src/generated/prisma/client';

@ApiTags('Messages')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, PoliciesGuard)
@Controller('conversations/:conversationId/messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @CheckPolicies((ability) =>
    ability.can(permission_action.CREATE, permission_cible.message),
  )
  @ApiOperation({ summary: 'Envoyer un nouveau message' })
  @ApiParam({ name: 'conversationId', description: 'UUID de la conversation' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Message envoyé.' })
  async create(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Body() dto: CreateMessageDto,
    @GetClerkUser() clerkUser: { sub: string },
  ) {
    return this.messageService.create(conversationId, dto, clerkUser.sub);
  }

  @Get()
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.message),
  )
  @ApiOperation({
    summary: 'Lister les messages d’une conversation avec pagination',
  })
  @ApiParam({ name: 'conversationId', description: 'UUID de la conversation' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Liste des messages.' })
  async findAll(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @GetClerkUser() clerkUser: { sub: string },
  ) {
    return this.messageService.findAllByConversation(
      conversationId,
      clerkUser.sub,
      page,
      limit,
    );
  }

  @Patch('read')
  @CheckPolicies((ability) =>
    ability.can(permission_action.UPDATE, permission_cible.message),
  )
  @ApiOperation({ summary: 'Marquer tous les messages comme lus' })
  @ApiParam({ name: 'conversationId', description: 'UUID de la conversation' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Messages marqués comme lus.',
  })
  async markAsRead(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @GetClerkUser() clerkUser: { sub: string },
  ) {
    return this.messageService.markAsRead(conversationId, clerkUser.sub);
  }

  @Patch(':messageId')
  @CheckPolicies((ability) =>
    ability.can(permission_action.UPDATE, permission_cible.message),
  )
  @ApiOperation({ summary: 'Modifier un message' })
  @ApiParam({ name: 'conversationId', description: 'UUID de la conversation' })
  @ApiParam({ name: 'messageId', description: 'UUID du message' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Message mis à jour.' })
  async update(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Body() dto: UpdateMessageDto,
    @GetClerkUser() clerkUser: { sub: string },
  ) {
    return this.messageService.update(
      messageId,
      dto,
      clerkUser.sub,
      conversationId,
    );
  }

  @Delete(':messageId')
  @CheckPolicies((ability) =>
    ability.can(permission_action.DELETE, permission_cible.message),
  )
  @ApiOperation({ summary: 'Supprimer un message' })
  @ApiParam({ name: 'conversationId', description: 'UUID de la conversation' })
  @ApiParam({ name: 'messageId', description: 'UUID du message' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Message supprimé.' })
  async remove(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @GetClerkUser() clerkUser: { sub: string },
  ) {
    return this.messageService.remove(messageId, clerkUser.sub, conversationId);
  }
}
