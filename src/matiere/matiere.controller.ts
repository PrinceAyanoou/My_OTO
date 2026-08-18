import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { MatiereService } from './matiere.service';
import {
  CreateMatiereDto,
  UpdateMatiereDto,
  QueryMatiereDto,
} from './dto/matiere.dto';

@ApiTags('Matières')
@UsePipes(ZodValidationPipe)
@Controller('ecoles/:ecoleId/matieres')
export class MatiereController {
  constructor(private readonly matiereService: MatiereService) {}

  //Créer une matière rattachée à une école
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une matière rattachée à une école' })
  @ApiParam({
    name: 'ecoleId',
    description: "ID de l'école (UUID)",
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @ApiResponse({
    status: 201,
    description: 'La matière a été créée avec succès.',
  })
  @ApiResponse({
    status: 404,
    description: 'École introuvable.',
  })
  @ApiResponse({
    status: 409,
    description: 'Une matière portant ce nom existe déjà dans cette école.',
  })
  create(@Param('ecoleId') ecoleId: string, @Body() dto: CreateMatiereDto) {
    return this.matiereService.create(ecoleId, dto);
  }

  //Lister toutes les matières d'une école
  @Get()
  @ApiOperation({ summary: "Lister toutes les matières d'une école" })
  @ApiParam({
    name: 'ecoleId',
    description: "ID de l'école (UUID)",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des matières récupérée avec succès.',
  })
  @ApiResponse({
    status: 404,
    description: "L'école n'existe pas ou ne dispose d'aucune matière.",
  })
  findAllByEcole(
    @Param('ecoleId') ecoleId: string,
    @Query() query: QueryMatiereDto,
  ) {
    return this.matiereService.findAllByEcole(ecoleId, query);
  }

  //Récupérer une matière spécifique de l’école
  @Get(':matiereId')
  @ApiOperation({ summary: 'Récupérer une matière spécifique de l’école' })
  @ApiParam({
    name: 'ecoleId',
    description: "ID de l'école (UUID)",
  })
  @ApiParam({
    name: 'matiereId',
    description: 'ID de la matière (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Détails de la matière.',
  })
  @ApiResponse({
    status: 404,
    description: 'Matière introuvable pour cette école.',
  })
  findOne(
    @Param('ecoleId') ecoleId: string,
    @Param('matiereId') matiereId: string,
  ) {
    return this.matiereService.findOne(ecoleId, matiereId);
  }

  //Mettre à jour une matière
  @Patch(':matiereId')
  @ApiOperation({ summary: 'Mettre à jour une matière' })
  @ApiParam({
    name: 'ecoleId',
    description: "ID de l'école (UUID)",
  })
  @ApiParam({
    name: 'matiereId',
    description: 'ID de la matière (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Matière mise à jour avec succès.',
  })
  @ApiResponse({
    status: 404,
    description: 'Matière introuvable.',
  })
  @ApiResponse({
    status: 409,
    description: 'Une autre matière portant ce nom existe déjà.',
  })
  update(
    @Param('ecoleId') ecoleId: string,
    @Param('matiereId') matiereId: string,
    @Body() dto: UpdateMatiereDto,
  ) {
    return this.matiereService.update(ecoleId, matiereId, dto);
  }

  //Supprimer une matière
  @Delete(':matiereId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une matière' })
  @ApiParam({
    name: 'ecoleId',
    description: "ID de l'école (UUID)",
  })
  @ApiParam({
    name: 'matiereId',
    description: 'ID de la matière (UUID)',
  })
  @ApiResponse({
    status: 204,
    description: 'Matière supprimée avec succès.',
  })
  @ApiResponse({
    status: 404,
    description: 'Matière introuvable.',
  })
  remove(
    @Param('ecoleId') ecoleId: string,
    @Param('matiereId') matiereId: string,
  ) {
    return this.matiereService.remove(ecoleId, matiereId);
  }
}
