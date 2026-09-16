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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';

import { ConfigurationScolariteService } from './configuration-scolarite.service';
import {
  ConfigurationScolariteQueryDto,
  CreateConfigurationScolariteDto,
  UpdateConfigurationScolariteDto,
} from './dto/configuration-scolarite.dto';

import { ClerkAuthGuard } from 'src/auth/guards/clerk-auth.guard';
import { PoliciesGuard } from 'src/auth/guards/permissions.guard';
import { CheckPolicies } from 'src/auth/decorators/check-permissions.decorator';
import {
  permission_action,
  permission_cible,
} from 'src/generated/prisma/client';

@ApiTags('Configurations Scolarité')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, PoliciesGuard)
@UsePipes(ZodValidationPipe)
@Controller('ecoles/:ecoleId/configurations-scolarite')
export class ConfigurationScolariteController {
  constructor(
    private readonly configurationScolariteService: ConfigurationScolariteService,
  ) {}

  // Créer une configuration de scolarité
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies((ability) =>
    ability.can(permission_action.CREATE, permission_cible.configScolarite),
  )
  @ApiOperation({
    summary: 'Créer une configuration de scolarité',
    description:
      "Associe une nouvelle configuration de scolarité à un niveau scolaire et une année scolaire au sein d'une école.",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'La configuration de scolarité a été créée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Données invalides ou niveau/année scolaire non conforme/introuvable pour cette école.',
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
    status: HttpStatus.CONFLICT,
    description:
      'Une configuration existe déjà pour ce niveau et cette année scolaire.',
  })
  create(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Body() dto: CreateConfigurationScolariteDto,
  ) {
    return this.configurationScolariteService.create(ecoleId, dto);
  }

  // Lister les configurations de scolarité
  @Get()
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.configScolarite),
  )
  @ApiOperation({
    summary: 'Lister les configurations de scolarité',
    description:
      "Récupère la liste paginée des configurations de scolarité filtrées optionnellement par niveau, année scolaire ou statut d'activation.",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des configurations récupérée avec succès.',
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
    description: "L'école spécifiée est introuvable.",
  })
  findAll(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Query() query: ConfigurationScolariteQueryDto,
  ) {
    return this.configurationScolariteService.findAll(ecoleId, query);
  }

  // Obtenir une configuration de scolarité par son ID
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.configScolarite),
  )
  @ApiOperation({
    summary: 'Obtenir une configuration de scolarité par son ID',
    description:
      "Récupère les détails complets d'une configuration de scolarité, incluant ses tranches triées par ordre.",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école",
    type: String,
  })
  @ApiParam({
    name: 'id',
    description: 'ID unique (UUID) de la configuration de scolarité',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails de la configuration récupérés avec succès.',
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
    description:
      "L'école n'existe pas ou la configuration est introuvable pour cette école.",
  })
  findOne(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.configurationScolariteService.findOne(ecoleId, id);
  }

  // Mettre à jour une configuration de scolarité
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.UPDATE, permission_cible.configScolarite),
  )
  @ApiOperation({
    summary: 'Mettre à jour une configuration de scolarité',
    description:
      "Met à jour partiellement les informations d'une configuration tout en vérifiant l'unicité du couple (niveauScolaire, anneeScolaire).",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école",
    type: String,
  })
  @ApiParam({
    name: 'id',
    description: 'ID unique (UUID) de la configuration à modifier',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'La configuration de scolarité a été mise à jour avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Données d'entrée ou UUID invalides.",
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
    description: 'La configuration est introuvable pour cette école.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'Une configuration existe déjà pour ce nouveau couple niveau/année scolaire.',
  })
  update(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateConfigurationScolariteDto,
  ) {
    return this.configurationScolariteService.update(ecoleId, id, dto);
  }

  // Supprimer une configuration de scolarité
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.DELETE, permission_cible.configScolarite),
  )
  @ApiOperation({
    summary: 'Supprimer une configuration de scolarité',
    description:
      "Supprime définitivement une configuration de scolarité pour l'école donnée.",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école",
    type: String,
  })
  @ApiParam({
    name: 'id',
    description: 'ID unique (UUID) de la configuration à supprimer',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'La configuration a été supprimée avec succès.',
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
    description: 'La configuration est introuvable pour cette école.',
  })
  remove(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.configurationScolariteService.remove(ecoleId, id);
  }
}
