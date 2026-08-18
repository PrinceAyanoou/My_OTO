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
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { UniteEnseignementService } from './unite-enseignement.service';
import {
  CreateUniteEnseignementDto,
  UpdateUniteEnseignementDto,
  QueryUniteEnseignementDto,
} from './dto/unite-enseignement.dto';

@ApiTags("Unités d'Enseignement")
@UsePipes(ZodValidationPipe)
@Controller('ecoles/:ecoleId/unites-enseignement')
export class UniteEnseignementController {
  constructor(
    private readonly uniteEnseignementService: UniteEnseignementService,
  ) {}

  //Créer une Unité d'Enseignement pour une école
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Créer une Unité d'Enseignement pour une école",
    description:
      'Le coefficient global est calculé automatiquement à partir de la somme des coefficients des matières fournies.',
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école rattrapée",
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: "L'UE a été créée avec succès avec son coefficient calculé.",
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides ou matières non associées à cette école.',
  })
  @ApiResponse({
    status: 404,
    description: 'École introuvable.',
  })
  @ApiResponse({
    status: 409,
    description: 'Une UE avec ce code existe déjà dans cette école.',
  })
  create(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Body() dto: CreateUniteEnseignementDto,
  ) {
    return this.uniteEnseignementService.create(ecoleId, dto);
  }

  //Lister toutes les Unités d'Enseignement d'une école
  @Get()
  @ApiOperation({
    summary: "Lister toutes les Unités d'Enseignement d'une école",
    description:
      'Permet de récupérer les UE filtrées par mot-clé (nom ou code).',
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école",
    type: String,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Terme de recherche pour filtrer sur le nom ou le code',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des UE récupérée avec succès.',
  })
  @ApiResponse({
    status: 404,
    description:
      'École introuvable ou aucun résultat ne correspond aux critères.',
  })
  findAllByEcole(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Query() query: QueryUniteEnseignementDto,
  ) {
    return this.uniteEnseignementService.findAllByEcole(ecoleId, query);
  }

  //Récupérer une UE spécifique par son ID et l'école
  @Get(':ueId')
  @ApiOperation({
    summary: "Récupérer une UE spécifique par son ID et l'école",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école",
    type: String,
  })
  @ApiParam({
    name: 'ueId',
    description: "ID unique (UUID) de l'Unité d'Enseignement",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Détails de l'unité d'enseignement récupérés.",
  })
  @ApiResponse({
    status: 404,
    description: "Unité d'enseignement introuvable pour cette école.",
  })
  findOne(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('ueId', ParseUUIDPipe) ueId: string,
  ) {
    return this.uniteEnseignementService.findOne(ecoleId, ueId);
  }

  //Mettre à jour une Unité d'Enseignement
  @Patch(':ueId')
  @ApiOperation({
    summary: "Mettre à jour une Unité d'Enseignement",
    description:
      "Si des matières sont transmises, le coefficient global de l'UE sera automatiquement recalculé.",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école",
    type: String,
  })
  @ApiParam({
    name: 'ueId',
    description: "ID unique (UUID) de l'Unité d'Enseignement",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "L'Unité d'Enseignement a été mise à jour avec succès.",
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides ou matières non rattachées à cette école.',
  })
  @ApiResponse({
    status: 404,
    description: "Unité d'enseignement introuvable.",
  })
  @ApiResponse({
    status: 409,
    description: 'Le nouveau code proposé est déjà utilisé dans cette école.',
  })
  update(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('ueId', ParseUUIDPipe) ueId: string,
    @Body() dto: UpdateUniteEnseignementDto,
  ) {
    return this.uniteEnseignementService.update(ecoleId, ueId, dto);
  }

  //Supprimer une Unité d'Enseignement d'une école
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Supprimer une Unité d'Enseignement d'une école",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école",
    type: String,
  })
  @ApiParam({
    name: 'id',
    description: "ID unique (UUID) de l'Unité d'Enseignement à supprimer",
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: "L'Unité d'Enseignement a été supprimée avec succès.",
  })
  @ApiResponse({
    status: 404,
    description: "Unité d'enseignement introuvable.",
  })
  remove(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.uniteEnseignementService.remove(ecoleId, id);
  }
}
