import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DemandeEcoleService } from './demande-ecole.service';
import type {
  DemanderCreationDto,
  DemanderModificationDto,
  DemanderSuppressionDto,
} from './dto/demande-ecole.dto';
import { ClerkAuthGuard } from 'src/auth/guards/clerk-auth.guard';
import { GetClerkUser } from 'src/auth/decorators/get-user.decorator';
import { verifyToken } from '@clerk/express';

type ClerkPayload = Awaited<ReturnType<typeof verifyToken>>;

@ApiTags('Demandes Ecoles')
@Controller('demandes-ecole')
export class DemandeEcoleController {
  constructor(private readonly demandeEcoleService: DemandeEcoleService) {}

  //faire une demande de création d'école.
  @Post('creation')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth('clerk-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Soumettre une demande de création d’une école',
    description:
      'Enregistre une nouvelle demande de création en attente de validation par le Back-Office.',
  })
  @ApiBody({
    description: 'Informations de l’école à créer',
    schema: {
      type: 'object',
      properties: {
        nom: { type: 'string', example: 'Complexe Scolaire Saint Joseph' },
        type: {
          type: 'string',
          enum: ['MATERNELLE_PRIMAIRE', 'COLLEGE_LYCEE', 'UNIVERSITE'],
        },
        nomFondateur: { type: 'string', example: 'Jean Dupont' },
        ville: { type: 'string', example: 'Cotonou' },
        email: { type: 'string', example: 'contact@cssj.com' },
        telephone: { type: 'string', example: '+22990000000' },
        boitePostale: { type: 'string', example: 'BP 123' },
        description: {
          type: 'string',
          example: 'École primaire et maternelle de référence',
        },
      },
    },
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

  //faire une demande de modification de l'école.
  @Post(':ecoleId/modification')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth('clerk-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Soumettre ou mettre à jour une demande de modification d’une école',
    description:
      'Permet au créateur de l’école de proposer des modifications. Si une demande est déjà en attente, les nouvelles valeurs sont fusionnées.',
  })
  @ApiBody({
    description: 'Identifiant de l’école, motif et champs à modifier',
    schema: {
      type: 'object',
      properties: {
        ecoleId: { type: 'string', format: 'uuid' },
        motif: {
          type: 'string',
          example: 'Mise à jour des coordonnées téléphoniques',
        },
        donnees: {
          type: 'object',
          properties: {
            nom: { type: 'string' },
            type: {
              type: 'string',
              enum: ['MATERNELLE_PRIMAIRE', 'COLLEGE_LYCEE', 'UNIVERSITE'],
            },
            nomFondateur: { type: 'string' },
            ville: { type: 'string' },
            email: { type: 'string' },
            telephone: { type: 'string' },
            boitePostale: { type: 'string' },
            description: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Demande de modification soumise avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Demande incompatible déjà en cours.',
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
  @ApiParam({ name: 'ecoleId', description: 'ID de l’école ciblée' })
  async demanderModification(
    @Param('ecoleId') ecoleId: string,
    @GetClerkUser() user: ClerkPayload,
    @Body() dto: DemanderModificationDto,
  ) {
    dto.ecoleId = ecoleId;
    const clerkUserId = user.sub;
    return this.demandeEcoleService.demanderModification(clerkUserId, dto);
  }

  //Faire une demande de suppression.
  @Post(':ecoleId/suppression')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth('clerk-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Soumettre une demande de suppression d’une école',
    description:
      'Passe l’école au statut TRAITEMENT_SUPPRESSION et crée une demande de suppression pour le Back-Office.',
  })
  @ApiBody({
    description: 'ID de l’école et motif obligatoire de suppression',
    schema: {
      type: 'object',
      properties: {
        ecoleId: { type: 'string', format: 'uuid' },
        motif: {
          type: 'string',
          example: 'Cessation définitive des activités de l’établissement',
        },
      },
    },
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
    status: HttpStatus.FORBIDDEN,
    description:
      'Seul le créateur de cette école peut demander sa suppression.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'École ou utilisateur introuvable.',
  })
  @ApiParam({ name: 'ecoleId', description: 'ID de l’école ciblée' })
  async demanderSuppression(
    @Param('ecoleId') ecoleId: string,
    @GetClerkUser() user: ClerkPayload,
    @Body() dto: DemanderSuppressionDto,
  ) {
    const clerkUserId = user.sub;
    dto.ecoleId = ecoleId;
    return this.demandeEcoleService.demanderSuppression(clerkUserId, dto);
  }

  //Consulter les demandes de son école.
  @Get('ecole/:ecoleId')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth('clerk-auth')
  @HttpCode(HttpStatus.OK)
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
  @ApiQuery({
    name: 'clerkUserId',
    type: String,
    description: 'Clerk User ID du demandeur',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Historique des demandes récupéré avec succès.',
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
    @Param('ecoleId') ecoleId: string,
    @GetClerkUser() user: ClerkPayload,
  ) {
    const clerkUserId = user.sub;
    return this.demandeEcoleService.findDemandesByEcole(ecoleId, clerkUserId);
  }
}
