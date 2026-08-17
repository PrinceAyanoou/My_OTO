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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PeriodeScolaireService } from './periode-scolaire.service';
import {
  CreatePeriodeScolaireDto,
  UpdatePeriodeScolaireDto,
  ChangeStatutPeriodeDto,
  QueryPeriodeScolaireDto,
} from './dto/periode-scolaire.dto';

@ApiTags('Périodes Scolaires')
@ApiBearerAuth()
@Controller('ecoles/:ecoleId/annees-scolaires/:anneeScolaireId/periodes')
export class PeriodeScolaireController {
  constructor(
    private readonly periodeScolaireService: PeriodeScolaireService,
  ) {}

  //Créer une nouvelle période scolaire.
  @Post()
  @ApiOperation({
    summary: 'Créer une nouvelle période scolaire',
    description:
      "Crée une période scolaire liée à une année scolaire. Les dates de la période doivent obligatoirement être comprises dans l'intervalle de l'année scolaire.",
  })
  @ApiParam({ name: 'ecoleId', description: "ID de l'école" })
  @ApiParam({ name: 'anneeScolaireId', description: "ID de l'année scolaire" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'La période scolaire a été créée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Dates invalides ou hors de l'intervalle de l'année scolaire.",
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Un nom ou un ordre identique existe déjà pour cette année.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'École ou année scolaire introuvable.',
  })
  create(
    @Param('ecoleId') ecoleId: string,
    @Param('anneeScolaireId') anneeScolaireId: string,
    @Body() dto: CreatePeriodeScolaireDto,
  ) {
    return this.periodeScolaireService.create(ecoleId, anneeScolaireId, dto);
  }

  //Lister les périodes scolaires
  @Get()
  @ApiOperation({
    summary: 'Lister les périodes scolaires',
    description:
      "Récupère la liste paginée des périodes scolaires d'une année scolaire avec possibilité de recherche et filtrage par statut.",
  })
  @ApiParam({ name: 'ecoleId', description: "ID de l'école" })
  @ApiParam({ name: 'anneeScolaireId', description: "ID de l'année scolaire" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des périodes scolaires récupérée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'École ou année scolaire introuvable.',
  })
  findAll(
    @Param('ecoleId') ecoleId: string,
    @Param('anneeScolaireId') anneeScolaireId: string,
    @Query() query: QueryPeriodeScolaireDto,
  ) {
    return this.periodeScolaireService.findAll(ecoleId, anneeScolaireId, query);
  }

  //Récupérer les détails d'une période scolaire.
  @Get(':periodeId')
  @ApiOperation({
    summary: "Récupérer les détails d'une période scolaire",
    description:
      'Affiche les informations détaillées ainsi que le décompte des entités liées (évaluations, bulletins, notes).',
  })
  @ApiParam({ name: 'ecoleId', description: "ID de l'école" })
  @ApiParam({ name: 'anneeScolaireId', description: "ID de l'année scolaire" })
  @ApiParam({ name: 'periodeId', description: 'ID de la période scolaire' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails de la période scolaire récupérés.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Période scolaire introuvable.',
  })
  findOne(
    @Param('ecoleId') ecoleId: string,
    @Param('anneeScolaireId') anneeScolaireId: string,
    @Param('periodeId') periodeId: string,
  ) {
    return this.periodeScolaireService.findOne(
      ecoleId,
      anneeScolaireId,
      periodeId,
    );
  }

  //mettre à jour une période scolaire.
  @Patch(':periodeId')
  @ApiOperation({
    summary: 'Mettre à jour une période scolaire',
    description:
      'Modifie partiellement une période scolaire. La mise à jour des dates reste contrainte par les bornes de l’année scolaire.',
  })
  @ApiParam({ name: 'ecoleId', description: "ID de l'école" })
  @ApiParam({ name: 'anneeScolaireId', description: "ID de l'année scolaire" })
  @ApiParam({ name: 'periodeId', description: 'ID de la période scolaire' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Période scolaire mise à jour avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dates incohérentes ou hors bornes.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflit de nom ou d’ordre avec une autre période.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Période scolaire introuvable.',
  })
  update(
    @Param('ecoleId') ecoleId: string,
    @Param('anneeScolaireId') anneeScolaireId: string,
    @Param('periodeId') periodeId: string,
    @Body() dto: UpdatePeriodeScolaireDto,
  ) {
    return this.periodeScolaireService.update(
      ecoleId,
      anneeScolaireId,
      periodeId,
      dto,
    );
  }

  //Changer le statut d'une période scolaire.
  @Patch(':periodeId/statut')
  @ApiOperation({
    summary: 'Changer le statut d’une période scolaire',
    description:
      'Permet de basculer le statut. Si le statut passe à OUVERTE, toute autre période ouverte sur l’année scolaire sera automatiquement clôturée.',
  })
  @ApiParam({ name: 'ecoleId', description: "ID de l'école" })
  @ApiParam({ name: 'anneeScolaireId', description: "ID de l'année scolaire" })
  @ApiParam({ name: 'periodeId', description: 'ID de la période scolaire' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statut mis à jour avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Période scolaire introuvable.',
  })
  changeStatut(
    @Param('ecoleId') ecoleId: string,
    @Param('anneeScolaireId') anneeScolaireId: string,
    @Param('periodeId') periodeId: string,
    @Body() dto: ChangeStatutPeriodeDto,
  ) {
    return this.periodeScolaireService.changeStatut(
      ecoleId,
      anneeScolaireId,
      periodeId,
      dto,
    );
  }

  //supprimer une période scolaire.
  @Delete(':periodeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer une période scolaire',
    description:
      'Supprime une période. La suppression échoue si la période est ouverte ou si elle contient des évaluations, bulletins ou notes.',
  })
  @ApiParam({ name: 'ecoleId', description: "ID de l'école" })
  @ApiParam({ name: 'anneeScolaireId', description: "ID de l'année scolaire" })
  @ApiParam({ name: 'periodeId', description: 'ID de la période scolaire' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Période supprimée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Impossible de supprimer une période ouverte ou ayant des entités rattachées.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Période scolaire introuvable.',
  })
  remove(
    @Param('ecoleId') ecoleId: string,
    @Param('anneeScolaireId') anneeScolaireId: string,
    @Param('periodeId') periodeId: string,
  ) {
    return this.periodeScolaireService.remove(
      ecoleId,
      anneeScolaireId,
      periodeId,
    );
  }
}
