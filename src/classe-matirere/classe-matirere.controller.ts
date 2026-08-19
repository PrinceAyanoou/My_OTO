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
import { ClasseMatiereService } from './classe-matirere.service';
import {
  CreateClasseMatiereDto,
  UpdateClasseMatiereDto,
  ClasseMatiereQueryDto,
} from './dto/classe-matirere.dto';

@ApiTags('Classes - Matières')
@UsePipes(ZodValidationPipe)
@Controller('ecoles/:ecoleId/classes-matieres')
export class ClasseMatiereController {
  constructor(private readonly classeMatiereService: ClasseMatiereService) {}

  //Associer une matière à une classe
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Associer une matière à une classe',
    description:
      "Crée une nouvelle association entre une classe et une matière pour une école donnée, en définissant son coefficient et éventuellement une Unité d'Enseignement (UE).",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école",
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: "L'association classe-matière a été créée avec succès.",
  })
  @ApiResponse({
    status: 400,
    description:
      "Données d'entrée invalides, UUID incorrect ou la classe/matière/UE spécifiée n'appartient pas à l'école.",
  })
  @ApiResponse({
    status: 409,
    description: 'Cette matière est déjà associée à cette classe.',
  })
  create(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Body() dto: CreateClasseMatiereDto,
  ) {
    return this.classeMatiereService.create(ecoleId, dto);
  }

  //Lister les associations classe-matière
  @Get()
  @ApiOperation({
    summary: 'Lister les associations classe-matière',
    description:
      "Récupère la liste paginée des matières associées aux classes d'une école avec la possibilité de filtrer par classe, matière ou unité d'enseignement.",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des associations classe-matière récupérée avec succès.',
  })
  @ApiResponse({
    status: 404,
    description: "L'école spécifiée est introuvable.",
  })
  findAll(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Query() query: ClasseMatiereQueryDto,
  ) {
    return this.classeMatiereService.findAll(ecoleId, query);
  }

  //Obtenir une association classe-matière par ID
  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir une association classe-matière par ID',
    description:
      "Récupère les détails d'une association spécifique entre une classe et une matière pour l'école donnée.",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école",
    type: String,
  })
  @ApiParam({
    name: 'id',
    description: "ID unique (UUID) de l'association classe-matière",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Détails de l'association récupérés avec succès.",
  })
  @ApiResponse({
    status: 404,
    description:
      "L'école n'existe pas ou l'association classe-matière est introuvable pour cette école.",
  })
  findOne(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.classeMatiereService.findOne(ecoleId, id);
  }

  //Mettre à jour une association classe-matière
  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour une association classe-matière',
    description:
      "Modifie le coefficient, la classe, la matière ou l'unité d'enseignement d'une association existante tout en validant les contraintes de domaine.",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école",
    type: String,
  })
  @ApiParam({
    name: 'id',
    description: "ID unique (UUID) de l'association à modifier",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "L'association a été mise à jour avec succès.",
  })
  @ApiResponse({
    status: 400,
    description:
      'Données de mise à jour invalides ou entités référencées non conformes.',
  })
  @ApiResponse({
    status: 404,
    description: "L'association est introuvable pour cette école.",
  })
  @ApiResponse({
    status: 409,
    description:
      'Une association existe déjà entre cette nouvelle classe et cette matière.',
  })
  update(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClasseMatiereDto,
  ) {
    return this.classeMatiereService.update(ecoleId, id, dto);
  }

  //Supprimer une association classe-matière
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer une association classe-matière',
    description:
      "Retire la liaison entre une classe et une matière pour l'école donnée.",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école",
    type: String,
  })
  @ApiParam({
    name: 'id',
    description: "ID unique (UUID) de l'association à supprimer",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "L'association a été supprimée avec succès.",
  })
  @ApiResponse({
    status: 404,
    description: "L'association est introuvable pour cette école.",
  })
  remove(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.classeMatiereService.remove(ecoleId, id);
  }
}
