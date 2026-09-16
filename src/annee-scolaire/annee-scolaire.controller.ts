import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { AnneeScolaireService } from './annee-scolaire.service';
import {
  CreateAnneeScolaireDto,
  UpdateAnneeScolaireDto,
  ChangeStatutAnneeScolaireDto,
  QueryAnneeScolaireDto,
} from './dto/annee-scolaire.dto';
import { ClerkAuthGuard } from 'src/auth/guards/clerk-auth.guard';
import { PoliciesGuard } from 'src/auth/guards/permissions.guard';
import { CheckPolicies } from 'src/auth/decorators/check-permissions.decorator';
import {
  permission_action,
  permission_cible,
} from 'src/generated/prisma/client';

@ApiTags('Années Scolaires')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, PoliciesGuard)
@UsePipes(ZodValidationPipe)
@Controller('ecoles/:ecoleId/annees-scolaires')
export class AnneeScolaireController {
  constructor(private readonly anneeScolaireService: AnneeScolaireService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies((ability) =>
    ability.can(permission_action.CREATE, permission_cible.anneeScolaire),
  )
  @ApiOperation({
    summary: 'Créer une nouvelle année scolaire',
    description:
      'Ajoute une année scolaire pour une école. Si le statut initial est défini sur `EN_COURS`, l’ancienne année active basculera automatiquement à `TERMINEE`.',
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID de l'école (UUID)",
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'L’année scolaire a été créée avec succès.',
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides ou dates incorrectes.',
  })
  @ApiResponse({
    status: 401,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: 403,
    description: 'Droits insuffisants pour effectuer cette action.',
  })
  @ApiResponse({
    status: 404,
    description: 'École introuvable.',
  })
  @ApiResponse({
    status: 409,
    description: 'Une année scolaire avec ce nom existe déjà dans cette école.',
  })
  create(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Body() dto: CreateAnneeScolaireDto,
  ) {
    return this.anneeScolaireService.create(ecoleId, dto);
  }

  @Get()
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.anneeScolaire),
  )
  @ApiOperation({
    summary: 'Lister les années scolaires',
    description:
      'Récupère la liste paginée des années scolaires associées à une école avec filtres par statut ou recherche.',
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID de l'école (UUID)",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des années scolaires récupérée avec succès.',
  })
  @ApiResponse({
    status: 401,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: 403,
    description: 'Droits insuffisants pour accéder à cette ressource.',
  })
  findAll(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Query() query: QueryAnneeScolaireDto,
  ) {
    return this.anneeScolaireService.findAll(ecoleId, query);
  }

  @Get('current')
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.anneeScolaire),
  )
  @ApiOperation({
    summary: 'Récupérer l’année scolaire actuellement en cours',
    description:
      'Retourne l’année scolaire active (statut `EN_COURS`) de l’école ainsi que ses périodes scolaires associées.',
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID de l'école (UUID)",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Année scolaire active récupérée avec succès.',
  })
  @ApiResponse({
    status: 401,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: 403,
    description: 'Droits insuffisants.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Aucune année scolaire active n’a été trouvée pour cette école.',
  })
  findCurrent(@Param('ecoleId', ParseUUIDPipe) ecoleId: string) {
    return this.anneeScolaireService.findCurrent(ecoleId);
  }

  @Get(':anneeScolaireId')
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.anneeScolaire),
  )
  @ApiOperation({
    summary: 'Récupérer les détails d’une année scolaire',
    description:
      'Retourne les détails complets d’une année scolaire incluant la liste de ses périodes ordonnées.',
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID de l'école (UUID)",
    type: String,
  })
  @ApiParam({
    name: 'anneeScolaireId',
    description: "ID de l'année scolaire (UUID)",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Détails de l’année scolaire récupérés avec succès.',
  })
  @ApiResponse({
    status: 401,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: 403,
    description: 'Droits insuffisants.',
  })
  @ApiResponse({
    status: 404,
    description: 'Année scolaire introuvable pour cette école.',
  })
  findOne(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('anneeScolaireId', ParseUUIDPipe) anneeScolaireId: string,
  ) {
    return this.anneeScolaireService.findOne(ecoleId, anneeScolaireId);
  }

  @Patch(':anneeScolaireId')
  @CheckPolicies((ability) =>
    ability.can(permission_action.UPDATE, permission_cible.anneeScolaire),
  )
  @ApiOperation({
    summary: 'Mettre à jour une année scolaire',
    description:
      'Met à jour le nom, les dates ou le statut d’une année scolaire.',
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID de l'école (UUID)",
    type: String,
  })
  @ApiParam({
    name: 'anneeScolaireId',
    description: "ID de l'année scolaire (UUID)",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Année scolaire mise à jour avec succès.',
  })
  @ApiResponse({
    status: 400,
    description: 'Données de mise à jour invalides.',
  })
  @ApiResponse({
    status: 401,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: 403,
    description: 'Droits insuffisants.',
  })
  @ApiResponse({
    status: 404,
    description: 'Année scolaire introuvable.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Le nouveau nom est déjà utilisé par une autre année scolaire.',
  })
  update(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('anneeScolaireId', ParseUUIDPipe) anneeScolaireId: string,
    @Body() dto: UpdateAnneeScolaireDto,
  ) {
    return this.anneeScolaireService.update(ecoleId, anneeScolaireId, dto);
  }

  @Patch(':anneeScolaireId/statut')
  @CheckPolicies((ability) =>
    ability.can(permission_action.UPDATE, permission_cible.anneeScolaire),
  )
  @ApiOperation({
    summary: 'Changer le statut d’une année scolaire',
    description:
      'Permet de modifier spécifiquement le statut (`EN_PREPARATION`, `EN_COURS`, `TERMINEE`, `ARCHIVEE`). Passer une année à `EN_COURS` clôturera automatiquement la précédente.',
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID de l'école (UUID)",
    type: String,
  })
  @ApiParam({
    name: 'anneeScolaireId',
    description: "ID de l'année scolaire (UUID)",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Statut de l’année scolaire modifié avec succès.',
  })
  @ApiResponse({
    status: 401,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: 403,
    description: 'Droits insuffisants.',
  })
  @ApiResponse({
    status: 404,
    description: 'Année scolaire introuvable.',
  })
  changeStatut(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('anneeScolaireId', ParseUUIDPipe) anneeScolaireId: string,
    @Body() dto: ChangeStatutAnneeScolaireDto,
  ) {
    return this.anneeScolaireService.changeStatut(
      ecoleId,
      anneeScolaireId,
      dto,
    );
  }

  @Delete(':anneeScolaireId')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.DELETE, permission_cible.anneeScolaire),
  )
  @ApiOperation({
    summary: 'Supprimer une année scolaire',
    description:
      'Supprime une année scolaire si elle n’est pas actuellement en cours.',
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID de l'école (UUID)",
    type: String,
  })
  @ApiParam({
    name: 'anneeScolaireId',
    description: "ID de l'année scolaire à supprimer (UUID)",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Année scolaire supprimée avec succès.',
  })
  @ApiResponse({
    status: 400,
    description: 'Impossible de supprimer une année scolaire active.',
  })
  @ApiResponse({
    status: 401,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: 403,
    description: 'Droits insuffisants.',
  })
  @ApiResponse({
    status: 404,
    description: 'Année scolaire introuvable.',
  })
  remove(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('anneeScolaireId', ParseUUIDPipe) anneeScolaireId: string,
  ) {
    return this.anneeScolaireService.remove(ecoleId, anneeScolaireId);
  }
}
