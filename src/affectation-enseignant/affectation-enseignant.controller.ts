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
import { AffectationEnseignantService } from './affectation-enseignant.service';
import {
  CreateAffectationEnseignantDto,
  UpdateAffectationEnseignantDto,
  AffectationEnseignantQueryDto,
} from './dto/affectation-enseignant.dto';

@ApiTags('Affectations Enseignants')
@UsePipes(ZodValidationPipe)
@Controller('ecoles/:ecoleId/affectations-enseignants')
export class AffectationEnseignantController {
  constructor(
    private readonly affectationEnseignantService: AffectationEnseignantService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer une nouvelle affectation enseignant',
    description:
      "Associe un enseignant (employé) à une matière, une classe et une année scolaire au sein de l'école spécifiée.",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école",
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: "L'affectation a été créée avec succès.",
  })
  @ApiResponse({
    status: 400,
    description: "Données d'entrée invalides ou formats UUID incorrects.",
  })
  @ApiResponse({
    status: 404,
    description:
      "L'employé, la classe, la matière ou l'année scolaire est introuvable pour cette école.",
  })
  @ApiResponse({
    status: 409,
    description:
      'Une affectation existe déjà pour cette matière, classe et année scolaire.',
  })
  create(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Body() dto: CreateAffectationEnseignantDto,
  ) {
    return this.affectationEnseignantService.create(ecoleId, dto);
  }

  @Get()
  @ApiOperation({
    summary: "Lister les affectations d'enseignants",
    description:
      'Récupère la liste paginée des affectations pour une école avec la possibilité de filtrer par employé, classe, matière ou année scolaire.',
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des affectations récupérée avec succès.',
  })
  @ApiResponse({
    status: 404,
    description: "L'école spécifiée est introuvable.",
  })
  findAll(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Query() query: AffectationEnseignantQueryDto,
  ) {
    return this.affectationEnseignantService.findAll(ecoleId, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: "Récupérer les détails d'une affectation",
    description:
      "Obtient les informations détaillées d'une affectation spécifique (y compris ses emplois du temps et évaluations associées).",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école",
    type: String,
  })
  @ApiParam({
    name: 'id',
    description: "ID unique (UUID) de l'affectation",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Détails de l'affectation récupérés avec succès.",
  })
  @ApiResponse({
    status: 404,
    description: "L'affectation est introuvable pour cette école.",
  })
  findOne(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.affectationEnseignantService.findOne(ecoleId, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour une affectation',
    description:
      "Modifie partiellement les informations d'une affectation existante en vérifiant les contraintes d'unicité.",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école",
    type: String,
  })
  @ApiParam({
    name: 'id',
    description: "ID unique (UUID) de l'affectation à modifier",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "L'affectation a été mise à jour avec succès.",
  })
  @ApiResponse({
    status: 400,
    description: 'Données de mise à jour invalides.',
  })
  @ApiResponse({
    status: 404,
    description: "L'affectation est introuvable pour cette école.",
  })
  @ApiResponse({
    status: 409,
    description:
      'Une autre affectation existe déjà pour le triplet (matière, classe, année scolaire).',
  })
  update(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAffectationEnseignantDto,
  ) {
    return this.affectationEnseignantService.update(ecoleId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer une affectation',
    description: "Supprime définitivement une affectation d'enseignant.",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école",
    type: String,
  })
  @ApiParam({
    name: 'id',
    description: "ID unique (UUID) de l'affectation à supprimer",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "L'affectation a été supprimée avec succès.",
  })
  @ApiResponse({
    status: 404,
    description: "L'affectation est introuvable pour cette école.",
  })
  remove(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.affectationEnseignantService.remove(ecoleId, id);
  }
}
