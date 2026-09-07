import {
  Controller,
  Get,
  Post,
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
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto, UpdateEvaluationDto } from './dto/evaluation.dto';

@ApiTags('Évaluations')
@Controller('ecoles/:ecoleId/evaluations')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  //Créer une évaluation
  @Post()
  @ApiOperation({
    summary: 'Créer/Programmer une évaluation',
    description:
      'Planifie un contrôle, examen ou devoir pour un cours et une classe.',
  })
  @ApiParam({ name: 'ecoleId', description: "UUID de l'école" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Évaluation créée avec succès.',
  })
  @ApiNotFoundResponse({
    description: 'Période, type ou affectation introuvable.',
  })
  create(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Body() dto: CreateEvaluationDto,
  ) {
    return this.evaluationService.create(dto, ecoleId);
  }

  //Lister les évaluations
  @Get()
  @ApiOperation({
    summary: 'Lister les évaluations',
    description:
      'Récupère les évaluations d’une école avec filtres optionnels.',
  })
  @ApiParam({ name: 'ecoleId', description: "UUID de l'école" })
  @ApiQuery({
    name: 'classeScolaireId',
    required: false,
    description: 'Filtrer par classe',
  })
  @ApiQuery({
    name: 'periodeScolaireId',
    required: false,
    description: 'Filtrer par période',
  })
  @ApiQuery({
    name: 'matiereId',
    required: false,
    description: 'Filtrer par matière',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des évaluations récupérée.',
  })
  findAllBySchool(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Query('classeScolaireId') classeScolaireId?: string,
    @Query('periodeScolaireId') periodeScolaireId?: string,
    @Query('matiereId') matiereId?: string,
  ) {
    return this.evaluationService.findAllBySchool(ecoleId, {
      classeScolaireId,
      periodeScolaireId,
      matiereId,
    });
  }

  //Obtenir les détails d’une évaluation
  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir les détails d’une évaluation',
    description: 'Récupère une évaluation avec la liste de ses notes.',
  })
  @ApiParam({ name: 'ecoleId', description: "UUID de l'école" })
  @ApiParam({ name: 'id', description: 'UUID de l’évaluation' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails de l’évaluation récupérés.',
  })
  @ApiNotFoundResponse({ description: 'Évaluation introuvable.' })
  findOne(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.evaluationService.findOne(id, ecoleId);
  }

  //Mettre à jour une évaluation
  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour une évaluation',
    description: 'Modifie les informations d’une évaluation.',
  })
  @ApiParam({ name: 'ecoleId', description: "UUID de l'école" })
  @ApiParam({ name: 'id', description: 'UUID de l’évaluation' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Évaluation mise à jour avec succès.',
  })
  @ApiNotFoundResponse({ description: 'Évaluation introuvable.' })
  update(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEvaluationDto,
  ) {
    return this.evaluationService.update(id, dto, ecoleId);
  }

  //Supprimer une évaluation
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer une évaluation',
    description: 'Supprime une évaluation si aucune note y est associée.',
  })
  @ApiParam({ name: 'ecoleId', description: "UUID de l'école" })
  @ApiParam({ name: 'id', description: 'UUID de l’évaluation' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Évaluation supprimée avec succès.',
  })
  @ApiBadRequestResponse({
    description: 'Suppression refusée car des notes y sont associées.',
  })
  @ApiNotFoundResponse({ description: 'Évaluation introuvable.' })
  remove(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.evaluationService.remove(id, ecoleId);
  }
}
