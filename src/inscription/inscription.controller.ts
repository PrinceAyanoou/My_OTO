import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { InscriptionService } from './inscription.service';
import { UpdateInscriptionDto, ChangeClasseDto } from './dto/inscription.dto';

@ApiTags('Inscriptions')
@Controller('ecoles/:ecoleId/inscriptions')
export class InscriptionController {
  constructor(private readonly inscriptionService: InscriptionService) {}

  //Lister toutes les inscriptions de l’école
  @Get()
  @ApiOperation({
    summary: 'Lister toutes les inscriptions de l’école',
    description:
      'Récupère la liste globale des inscriptions, filtrable par année scolaire ou par classe.',
  })
  @ApiParam({ name: 'ecoleId', description: "UUID unique de l'école" })
  @ApiQuery({
    name: 'anneeScolaireId',
    required: false,
    type: String,
    description: "Filtrer les inscriptions par ID d'année scolaire",
  })
  @ApiQuery({
    name: 'classeScolaireId',
    required: false,
    type: String,
    description: 'Filtrer les inscriptions par ID de classe',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des inscriptions récupérée avec succès.',
  })
  findAllBySchool(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Query('anneeScolaireId') anneeScolaireId?: string,
    @Query('classeScolaireId') classeScolaireId?: string,
  ) {
    return this.inscriptionService.findAllBySchool(
      ecoleId,
      anneeScolaireId,
      classeScolaireId,
    );
  }

  //'Obtenir une inscription spécifique
  @Get('apprenants/:apprenantId/annees/:anneeScolaireId')
  @ApiOperation({
    summary: 'Obtenir une inscription spécifique',
    description:
      "Récupère les détails d'une inscription à partir de sa clé composée (apprenantId + anneeScolaireId).",
  })
  @ApiParam({ name: 'ecoleId', description: "UUID unique de l'école" })
  @ApiParam({ name: 'apprenantId', description: "UUID de l'apprenant" })
  @ApiParam({
    name: 'anneeScolaireId',
    description: "UUID de l'année scolaire",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Détails de l'inscription.",
  })
  @ApiNotFoundResponse({
    description:
      'Inscription introuvable pour cet apprenant et cette année scolaire.',
  })
  findOne(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('apprenantId', ParseUUIDPipe) apprenantId: string,
    @Param('anneeScolaireId', ParseUUIDPipe) anneeScolaireId: string,
  ) {
    return this.inscriptionService.findOne(
      apprenantId,
      anneeScolaireId,
      ecoleId,
    );
  }

  //Consulte toutes les inscriptions enregistrées pour un apprenant au fil des années.
  @Get('apprenants/:apprenantId/historique')
  @ApiOperation({
    summary: 'Historique des inscriptions d’un apprenant',
    description:
      'Consulte toutes les inscriptions enregistrées pour un apprenant au fil des années.',
  })
  @ApiParam({ name: 'ecoleId', description: "UUID unique de l'école" })
  @ApiParam({ name: 'apprenantId', description: "UUID de l'apprenant" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Historique d'inscriptions de l'apprenant.",
  })
  findHistoryByApprenant(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('apprenantId', ParseUUIDPipe) apprenantId: string,
  ) {
    return this.inscriptionService.findHistoryByApprenant(apprenantId, ecoleId);
  }

  //Changer la classe d’une inscription
  @Patch('apprenants/:apprenantId/annees/:anneeScolaireId/changer-classe')
  @ApiOperation({
    summary: 'Changer la classe d’une inscription',
    description:
      'Transfère une inscription vers une autre classe après vérification des capacités d’accueil et de l’absence de notes existantes.',
  })
  @ApiParam({ name: 'ecoleId', description: "UUID unique de l'école" })
  @ApiParam({ name: 'apprenantId', description: "UUID de l'apprenant" })
  @ApiParam({
    name: 'anneeScolaireId',
    description: "UUID de l'année scolaire",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Classe de l’inscription modifiée avec succès.',
  })
  @ApiBadRequestResponse({
    description:
      'Changement refusé (même classe, capacité maximale atteinte ou notes déjà existantes).',
  })
  @ApiNotFoundResponse({
    description: 'Inscription ou classe de destination introuvable.',
  })
  changeClasse(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('apprenantId', ParseUUIDPipe) apprenantId: string,
    @Param('anneeScolaireId', ParseUUIDPipe) anneeScolaireId: string,
    @Body() dto: ChangeClasseDto,
  ) {
    return this.inscriptionService.changeClasse(
      apprenantId,
      anneeScolaireId,
      dto,
      ecoleId,
    );
  }

  //Mettre à jour une inscription
  @Patch('apprenants/:apprenantId/annees/:anneeScolaireId')
  @ApiOperation({
    summary: 'Mettre à jour une inscription',
    description:
      'Met à jour les informations générales associées à une inscription.',
  })
  @ApiParam({ name: 'ecoleId', description: "UUID unique de l'école" })
  @ApiParam({ name: 'apprenantId', description: "UUID de l'apprenant" })
  @ApiParam({
    name: 'anneeScolaireId',
    description: "UUID de l'année scolaire",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inscription mise à jour avec succès.',
  })
  @ApiNotFoundResponse({
    description: 'Inscription introuvable.',
  })
  update(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('apprenantId', ParseUUIDPipe) apprenantId: string,
    @Param('anneeScolaireId', ParseUUIDPipe) anneeScolaireId: string,
    @Body() dto: UpdateInscriptionDto,
  ) {
    return this.inscriptionService.update(
      apprenantId,
      anneeScolaireId,
      dto,
      ecoleId,
    );
  }

  //Supprimer une inscription
  @Delete('apprenants/:apprenantId/annees/:anneeScolaireId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer une inscription',
    description:
      'Supprime définitivement une inscription et son dossier de scolarité associées.',
  })
  @ApiParam({ name: 'ecoleId', description: "UUID unique de l'école" })
  @ApiParam({ name: 'apprenantId', description: "UUID de l'apprenant" })
  @ApiParam({
    name: 'anneeScolaireId',
    description: "UUID de l'année scolaire",
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Inscription supprimée avec succès.',
  })
  @ApiNotFoundResponse({
    description: 'Inscription introuvable.',
  })
  remove(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('apprenantId', ParseUUIDPipe) apprenantId: string,
    @Param('anneeScolaireId', ParseUUIDPipe) anneeScolaireId: string,
  ) {
    return this.inscriptionService.remove(
      apprenantId,
      anneeScolaireId,
      ecoleId,
    );
  }
}
