import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RegleEvaluationService } from './regle-evaluation.service';
import {
  CreateRegleEvaluationDto,
  UpdateRegleEvaluationDto,
} from './dto/regle-evaluation.dto';

@ApiTags("Règles d'Évaluation")
@Controller('ecoles/:ecoleId/regles-evaluation')
export class RegleEvaluationController {
  constructor(
    private readonly regleEvaluationService: RegleEvaluationService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Créer une nouvelle règle d'évaluation" })
  @ApiParam({
    name: 'ecoleId',
    description: 'UUID de l’école',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'La règle d’évaluation a été créée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données de requête invalides.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Politique ou type d’évaluation introuvable.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Une règle existe déjà pour ce type dans cette politique.',
  })
  create(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Body() dto: CreateRegleEvaluationDto,
  ) {
    return this.regleEvaluationService.create(dto, ecoleId);
  }

  @Get('politique/:politiqueId')
  @ApiOperation({
    summary: 'Récupérer toutes les règles associées à une politique',
  })
  @ApiParam({
    name: 'ecoleId',
    description: 'UUID de l’école',
  })
  @ApiParam({
    name: 'politiqueId',
    description: 'UUID de la politique d’évaluation',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des règles d’évaluation récupérée.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Politique d’évaluation introuvable.',
  })
  findByPolitique(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('politiqueId', ParseUUIDPipe) politiqueId: string,
  ) {
    return this.regleEvaluationService.findByPolitique(politiqueId, ecoleId);
  }

  @Get(':id')
  @ApiOperation({ summary: "Récupérer une règle d'évaluation par son ID" })
  @ApiParam({
    name: 'ecoleId',
    description: 'UUID de l’école',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la règle d’évaluation',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails de la règle d’évaluation.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Règle d’évaluation introuvable.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Accès non autorisé à cette règle.',
  })
  findOne(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.regleEvaluationService.findOne(id, ecoleId);
  }

  @Patch(':id')
  @ApiOperation({ summary: "Mettre à jour une règle d'évaluation" })
  @ApiParam({
    name: 'ecoleId',
    description: 'UUID de l’école',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la règle d’évaluation',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Règle mise à jour avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Règle d’évaluation introuvable.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Accès non autorisé.',
  })
  update(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRegleEvaluationDto,
  ) {
    return this.regleEvaluationService.update(id, dto, ecoleId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Supprimer une règle d'évaluation" })
  @ApiParam({
    name: 'ecoleId',
    description: 'UUID de l’école',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la règle d’évaluation',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Règle supprimée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Règle d’évaluation introuvable.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Accès non autorisé.',
  })
  remove(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.regleEvaluationService.remove(id, ecoleId);
  }
}
