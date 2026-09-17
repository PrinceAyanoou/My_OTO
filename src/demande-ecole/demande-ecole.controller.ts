import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { verifyToken } from '@clerk/express';

import { DemandeEcoleService } from './demande-ecole.service';
import {
  DemanderCreationDto,
  DemanderModificationDto,
  DemanderSuppressionDto,
} from './dto/demande-ecole.dto';

import { ClerkAuthGuard } from 'src/auth/guards/clerk-auth.guard';
import { PoliciesGuard } from 'src/auth/guards/permissions.guard';
import { CheckPolicies } from 'src/auth/decorators/check-permissions.decorator';
import { GetClerkUser } from 'src/auth/decorators/get-user.decorator';
import { permission_action } from 'src/generated/prisma/client';

type ClerkPayload = Awaited<ReturnType<typeof verifyToken>>;

@ApiTags('Demandes Ecoles')
@ApiBearerAuth('clerk-auth')
@UseGuards(ClerkAuthGuard, PoliciesGuard)
@UsePipes(ZodValidationPipe)
@Controller('demandes-ecole')
export class DemandeEcoleController {
  constructor(private readonly demandeEcoleService: DemandeEcoleService) {}

  // Faire une demande de création d'école
  @Post('creation')
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies((ability) =>
    ability.can(permission_action.CREATE, 'demandeEcole'),
  )
  @ApiOperation({
    summary: 'Soumettre une demande de création d’une école',
    description:
      'Enregistre une nouvelle demande de création en attente de validation par le Back-Office.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Demande de création enregistrée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données de formulaire invalides.',
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
    description: 'Utilisateur demandeur introuvable.',
  })
  async demanderCreation(
    @GetClerkUser() user: ClerkPayload,
    @Body() dto: DemanderCreationDto,
  ) {
    const clerkUserId = user.sub;
    return this.demandeEcoleService.demanderCreation(clerkUserId, dto);
  }

  // Faire une demande de modification de l'école
  @Post(':ecoleId/modification')
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies((ability) =>
    ability.can(permission_action.CREATE, 'demandeEcole'),
  )
  @ApiOperation({
    summary:
      'Soumettre ou mettre à jour une demande de modification d’une école',
    description:
      'Permet au créateur de l’école de proposer des modifications. Si une demande est déjà en attente, les nouvelles valeurs sont fusionnées.',
  })
  @ApiParam({
    name: 'ecoleId',
    type: String,
    description: 'ID UUID de l’école ciblée',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Demande de modification soumise avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Demande incompatible déjà en cours ou UUID invalide.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'Seul le créateur de cette école peut effectuer cette demande.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'École ou utilisateur introuvable.',
  })
  async demanderModification(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @GetClerkUser() user: ClerkPayload,
    @Body() dto: DemanderModificationDto,
  ) {
    dto.ecoleId = ecoleId;
    const clerkUserId = user.sub;
    return this.demandeEcoleService.demanderModification(clerkUserId, dto);
  }

  // Faire une demande de suppression
  @Post(':ecoleId/suppression')
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies((ability) =>
    ability.can(permission_action.CREATE, 'demandeEcole'),
  )
  @ApiOperation({
    summary: 'Soumettre une demande de suppression d’une école',
    description:
      'Passe l’école au statut TRAITEMENT_SUPPRESSION et crée une demande de suppression pour le Back-Office.',
  })
  @ApiParam({
    name: 'ecoleId',
    type: String,
    description: 'ID UUID de l’école ciblée',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Demande de suppression créée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Une demande est déjà en cours pour cette école.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'Seul le créateur de cette école peut demander sa suppression.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'École ou utilisateur introuvable.',
  })
  async demanderSuppression(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @GetClerkUser() user: ClerkPayload,
    @Body() dto: DemanderSuppressionDto,
  ) {
    dto.ecoleId = ecoleId;
    const clerkUserId = user.sub;
    return this.demandeEcoleService.demanderSuppression(clerkUserId, dto);
  }

  // Consulter les demandes de son école
  @Get('ecole/:ecoleId')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.CREATE, 'demandeEcole'),
  )
  @ApiOperation({
    summary: 'Consulter l’historique des demandes d’une école',
    description:
      'Retourne toutes les demandes (création, modification, suppression) liées à une école. Accessible uniquement par le créateur.',
  })
  @ApiParam({
    name: 'ecoleId',
    type: String,
    description: 'ID UUID de l’école',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Historique des demandes récupéré avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Accès refusé : utilisateur n’est pas le créateur de l’école.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'École introuvable.',
  })
  async findDemandesByEcole(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @GetClerkUser() user: ClerkPayload,
  ) {
    const clerkUserId = user.sub;
    return this.demandeEcoleService.findDemandesByEcole(ecoleId, clerkUserId);
  }
}
