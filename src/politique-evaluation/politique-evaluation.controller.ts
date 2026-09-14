import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
} from '@nestjs/swagger';
import { PolitiqueEvaluationService } from './politique-evaluation.service';
import {
  CreatePolitiqueEvaluationDto,
  UpdatePolitiqueEvaluationDto,
} from './dto/politique-evaluation.dto';

@ApiTags("Politiques d'Évaluation")
@Controller('ecoles/:ecoleId/politiques-evaluation')
export class PolitiqueEvaluationController {
  constructor(
    private readonly politiqueEvaluationService: PolitiqueEvaluationService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Créer une nouvelle politique d'évaluation" })
  @ApiParam({
    name: 'ecoleId',
    description: 'UUID de l’école',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'La politique d’évaluation a été créée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données de requête invalides.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Année scolaire ou classe introuvable.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'Une politique porte déjà ce nom ou est déjà liée à cette classe.',
  })
  create(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Body() dto: CreatePolitiqueEvaluationDto,
  ) {
    return this.politiqueEvaluationService.create(dto, ecoleId);
  }

  @Get()
  @ApiOperation({
    summary: "Lister toutes les politiques d'évaluation d'une école",
  })
  @ApiParam({
    name: 'ecoleId',
    description: 'UUID de l’école',
  })
  @ApiQuery({
    name: 'anneeScolaireId',
    required: false,
    description: 'Filtrer par année scolaire',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des politiques d’évaluation récupérée.',
  })
  findAll(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Query('anneeScolaireId') anneeScolaireId?: string,
  ) {
    return this.politiqueEvaluationService.findAll(ecoleId, anneeScolaireId);
  }

  @Get(':id')
  @ApiOperation({ summary: "Récupérer une politique d'évaluation par son ID" })
  @ApiParam({
    name: 'ecoleId',
    description: 'UUID de l’école',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la politique d’évaluation',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails de la politique d’évaluation.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Politique d’évaluation introuvable.',
  })
  findOne(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.politiqueEvaluationService.findOne(id, ecoleId);
  }

  @Patch(':id')
  @ApiOperation({ summary: "Mettre à jour une politique d'évaluation" })
  @ApiParam({
    name: 'ecoleId',
    description: 'UUID de l’école',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la politique d’évaluation',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Politique d’évaluation mise à jour avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Politique d’évaluation introuvable.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflit sur le nom ou la classe sélectionnée.',
  })
  update(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePolitiqueEvaluationDto,
  ) {
    return this.politiqueEvaluationService.update(id, dto, ecoleId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Supprimer une politique d'évaluation" })
  @ApiParam({
    name: 'ecoleId',
    description: 'UUID de l’école',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la politique d’évaluation',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Politique d’évaluation supprimée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Politique d’évaluation introuvable.',
  })
  remove(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.politiqueEvaluationService.remove(id, ecoleId);
  }
}
