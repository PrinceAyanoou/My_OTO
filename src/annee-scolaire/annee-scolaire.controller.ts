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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AnneeScolaireService } from './annee-scolaire.service';
import {
  CreateAnneeScolaireDto,
  UpdateAnneeScolaireDto,
  ChangeStatutAnneeScolaireDto,
  QueryAnneeScolaireDto,
} from './dto/annee-scolaire.dto';

@ApiTags('Années Scolaires')
@ApiBearerAuth()
@Controller('ecoles/:ecoleId/annees-scolaires')
export class AnneeScolaireController {
  constructor(private readonly anneeScolaireService: AnneeScolaireService) {}

  @Post()
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
    status: HttpStatus.CREATED,
    description: 'L’année scolaire a été créée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Données invalides ou date de fin antérieure à la date de début.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Une année scolaire avec ce nom existe déjà dans cette école.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'École introuvable.',
  })
  async create(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Body() dto: CreateAnneeScolaireDto,
  ) {
    return this.anneeScolaireService.create(ecoleId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les années scolaires',
    description:
      'Récupère la liste paginée des années scolaires associées à une école avec filtres par statut ou terme de recherche.',
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID de l'école (UUID)",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des années scolaires récupérée avec succès.',
  })
  async findAll(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Query() query: QueryAnneeScolaireDto,
  ) {
    return this.anneeScolaireService.findAll(ecoleId, query);
  }

  @Get('current')
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
    status: HttpStatus.OK,
    description: 'Année scolaire active récupérée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description:
      'Aucune année scolaire active n’a été trouvée pour cette école.',
  })
  async findCurrent(@Param('ecoleId', ParseUUIDPipe) ecoleId: string) {
    return this.anneeScolaireService.findCurrent(ecoleId);
  }

  @Get(':anneeScolaireId')
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
    status: HttpStatus.OK,
    description: 'Détails de l’année scolaire récupérés avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Année scolaire introuvable pour cette école.',
  })
  async findOne(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('anneeScolaireId', ParseUUIDPipe) anneeScolaireId: string,
  ) {
    return this.anneeScolaireService.findOne(ecoleId, anneeScolaireId);
  }

  @Patch(':anneeScolaireId')
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
    status: HttpStatus.OK,
    description: 'Année scolaire mise à jour avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données de mise à jour invalides.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'Le nouveau nom est déjà utilisé par une autre année scolaire.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Année scolaire introuvable.',
  })
  async update(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('anneeScolaireId', ParseUUIDPipe) anneeScolaireId: string,
    @Body() dto: UpdateAnneeScolaireDto,
  ) {
    return this.anneeScolaireService.update(ecoleId, anneeScolaireId, dto);
  }

  @Patch(':anneeScolaireId/statut')
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
    status: HttpStatus.OK,
    description: 'Statut de l’année scolaire modifié avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Année scolaire introuvable.',
  })
  async changeStatut(
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
    status: HttpStatus.OK,
    description: 'Année scolaire supprimée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Impossible de supprimer une année scolaire active.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Année scolaire introuvable.',
  })
  async remove(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('anneeScolaireId', ParseUUIDPipe) anneeScolaireId: string,
  ) {
    return this.anneeScolaireService.remove(ecoleId, anneeScolaireId);
  }
}
