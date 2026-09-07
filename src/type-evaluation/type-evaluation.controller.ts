import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { TypeEvaluationService } from './type-evaluation.service';
import {
  CreateTypeEvaluationDto,
  UpdateTypeEvaluationDto,
} from './dto/type-evaluation.dto';

@ApiTags('Types d’Évaluation')
@Controller('ecoles/:ecoleId/types-evaluation')
export class TypeEvaluationController {
  constructor(private readonly typeEvaluationService: TypeEvaluationService) {}

  //Créer un type d’évaluation
  @Post()
  @ApiOperation({
    summary: 'Créer un type d’évaluation',
    description:
      'Ajoute une nouvelle catégorie d’évaluation (ex: Interrogation, Devoir, Examen) pour l’école.',
  })
  @ApiParam({ name: 'ecoleId', description: "UUID unique de l'école" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Type d’évaluation créé avec succès.',
  })
  @ApiConflictResponse({
    description: 'Un type d’évaluation avec ce nom existe déjà dans l’école.',
  })
  create(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Body() dto: CreateTypeEvaluationDto,
  ) {
    return this.typeEvaluationService.create(dto, ecoleId);
  }

  //Lister les types d’évaluation d’une école
  @Get()
  @ApiOperation({
    summary: 'Lister les types d’évaluation d’une école',
    description:
      'Récupère tous les types d’évaluation enregistrés pour l’école.',
  })
  @ApiParam({ name: 'ecoleId', description: "UUID unique de l'école" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des types d’évaluation récupérée.',
  })
  findAllBySchool(@Param('ecoleId', ParseUUIDPipe) ecoleId: string) {
    return this.typeEvaluationService.findAllBySchool(ecoleId);
  }

  //Obtenir les détails d’un type d’évaluation
  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir les détails d’un type d’évaluation',
    description: 'Récupère un type d’évaluation par son UUID.',
  })
  @ApiParam({ name: 'ecoleId', description: "UUID unique de l'école" })
  @ApiParam({ name: 'id', description: 'UUID du type d’évaluation' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails du type d’évaluation.',
  })
  @ApiNotFoundResponse({
    description: 'Type d’évaluation introuvable.',
  })
  findOne(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.typeEvaluationService.findOne(id, ecoleId);
  }

  //Mettre à jour un type d’évaluation
  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour un type d’évaluation',
    description: 'Modifie le nom d’un type d’évaluation existant.',
  })
  @ApiParam({ name: 'ecoleId', description: "UUID unique de l'école" })
  @ApiParam({ name: 'id', description: 'UUID du type d’évaluation' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Type d’évaluation mis à jour avec succès.',
  })
  @ApiNotFoundResponse({
    description: 'Type d’évaluation introuvable.',
  })
  @ApiConflictResponse({
    description: 'Nom déjà pris par un autre type d’évaluation.',
  })
  update(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTypeEvaluationDto,
  ) {
    return this.typeEvaluationService.update(id, dto, ecoleId);
  }

  //Supprimer un type d’évaluation
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer un type d’évaluation',
    description:
      'Supprime un type d’évaluation s’il n’est rattaché à aucune évaluation existante.',
  })
  @ApiParam({ name: 'ecoleId', description: "UUID unique de l'école" })
  @ApiParam({ name: 'id', description: 'UUID du type d’évaluation' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Type d’évaluation supprimé avec succès.',
  })
  @ApiBadRequestResponse({
    description: 'Suppression refusée car le type est déjà utilisé.',
  })
  @ApiNotFoundResponse({
    description: 'Type d’évaluation introuvable.',
  })
  remove(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.typeEvaluationService.remove(id, ecoleId);
  }
}
