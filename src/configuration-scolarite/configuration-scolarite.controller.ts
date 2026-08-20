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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { ConfigurationScolariteService } from './configuration-scolarite.service';
import {
  CreateConfigurationScolariteDto,
  UpdateConfigurationScolariteDto,
  ConfigurationScolariteQueryDto,
} from './dto/configuration-scolarite.dto';

@ApiTags('Configurations Scolarité')
@UsePipes(ZodValidationPipe)
@Controller('ecoles/:ecoleId/configurations-scolarite')
export class ConfigurationScolariteController {
  constructor(
    private readonly configurationScolariteService: ConfigurationScolariteService,
  ) {}

  //Créer une configuration de scolarité
  @Post()
  @HttpCode(HttpStatus.CREATED)
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
    status: 201,
    description: 'La configuration de scolarité a été créée avec succès.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Données invalides ou niveau/année scolaire non conforme/introuvable pour cette école.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Une configuration existe déjà pour ce niveau et cette année scolaire.',
  })
  create(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Body() dto: CreateConfigurationScolariteDto,
  ) {
    return this.configurationScolariteService.create(ecoleId, dto);
  }

  //Lister les configurations de scolarité
  @Get()
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
    status: 200,
    description: 'Liste des configurations récupérée avec succès.',
  })
  @ApiResponse({
    status: 404,
    description: "L'école spécifiée est introuvable.",
  })
  findAll(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Query() query: ConfigurationScolariteQueryDto,
  ) {
    return this.configurationScolariteService.findAll(ecoleId, query);
  }

  //Obtenir une configuration de scolarité par son ID
  @Get(':id')
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
    status: 200,
    description: 'Détails de la configuration récupérés avec succès.',
  })
  @ApiResponse({
    status: 404,
    description:
      "L'école n'existe pas ou la configuration est introuvable pour cette école.",
  })
  findOne(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.configurationScolariteService.findOne(ecoleId, id);
  }

  //Mettre à jour une configuration de scolarité
  @Patch(':id')
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
    status: 200,
    description: 'La configuration de scolarité a été mise à jour avec succès.',
  })
  @ApiResponse({
    status: 400,
    description: "Données d'entrée ou UUID invalides.",
  })
  @ApiResponse({
    status: 404,
    description: 'La configuration est introuvable pour cette école.',
  })
  @ApiResponse({
    status: 409,
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

  //Supprimer une configuration de scolarité
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
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
    status: 200,
    description: 'La configuration a été supprimée avec succès.',
  })
  @ApiResponse({
    status: 404,
    description: 'La configuration est introuvable pour cette école.',
  })
  remove(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.configurationScolariteService.remove(ecoleId, id);
  }
}
