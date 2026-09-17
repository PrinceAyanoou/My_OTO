import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ParticipantConversationService } from './participant-conversation.service';
import {
  AddParticipantsDto,
  UpdateParticipantRoleDto,
} from './dto/participant-conversation.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';
import { CheckPolicies } from '../auth/decorators/check-permissions.decorator';
import { GetClerkUser } from '../auth/decorators/get-user.decorator';
import {
  permission_action,
  permission_cible,
} from 'src/generated/prisma/client';

@ApiTags('Participants Conversation')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, PoliciesGuard)
@Controller('conversations/:conversationId/participants')
export class ParticipantConversationController {
  constructor(
    private readonly participantService: ParticipantConversationService,
  ) {}

  @Get()
  @CheckPolicies((ability) =>
    ability.can(
      permission_action.READ,
      permission_cible.participantConversation,
    ),
  )
  @ApiOperation({ summary: 'Lister les participants d’une conversation' })
  @ApiParam({ name: 'conversationId', description: 'UUID de la conversation' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des participants.',
  })
  async findAll(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @GetClerkUser() clerkUser: { sub: string },
  ) {
    return this.participantService.findAllByConversation(
      conversationId,
      clerkUser.sub,
    );
  }

  @Post()
  @CheckPolicies((ability) =>
    ability.can(
      permission_action.CREATE,
      permission_cible.participantConversation,
    ),
  )
  @ApiOperation({
    summary: 'Ajouter des participants (Admin du groupe requis)',
  })
  @ApiParam({ name: 'conversationId', description: 'UUID de la conversation' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Participants ajoutés.',
  })
  async addParticipants(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Body() dto: AddParticipantsDto,
    @GetClerkUser() clerkUser: { sub: string },
  ) {
    return this.participantService.addParticipants(
      conversationId,
      dto,
      clerkUser.sub,
    );
  }

  @Patch(':userId/role')
  @CheckPolicies((ability) =>
    ability.can(
      permission_action.UPDATE,
      permission_cible.participantConversation,
    ),
  )
  @ApiOperation({
    summary: 'Mettre à jour le rôle d’un membre (ADMIN ou MEMBRE)',
  })
  @ApiParam({ name: 'conversationId', description: 'UUID de la conversation' })
  @ApiParam({ name: 'userId', description: 'UUID du participant à modifier' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Rôle mis à jour.' })
  async updateRole(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateParticipantRoleDto,
    @GetClerkUser() clerkUser: { sub: string },
  ) {
    return this.participantService.updateRole(
      conversationId,
      userId,
      dto,
      clerkUser.sub,
    );
  }

  @Delete(':userId')
  @CheckPolicies((ability) =>
    ability.can(
      permission_action.DELETE,
      permission_cible.participantConversation,
    ),
  )
  @ApiOperation({
    summary: 'Retirer un participant ou quitter la conversation',
  })
  @ApiParam({ name: 'conversationId', description: 'UUID de la conversation' })
  @ApiParam({ name: 'userId', description: 'UUID du participant à retirer' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Participant retiré.' })
  async removeParticipant(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @GetClerkUser() clerkUser: { sub: string },
  ) {
    return this.participantService.removeParticipant(
      conversationId,
      userId,
      clerkUser.sub,
    );
  }
}
