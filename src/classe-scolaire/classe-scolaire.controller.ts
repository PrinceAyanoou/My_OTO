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
import { ClasseScolaireService } from './classe-scolaire.service';
import {
  CreateClasseScolaireDto,
  UpdateClasseScolaireDto,
  QueryClasseScolaireDto,
} from './dto/classe-scolaire.dto';

@ApiTags('Classes Scolaires')
@UsePipes(ZodValidationPipe)
@Controller()
export class ClasseScolaireController {
  constructor(private readonly classeScolaireService: ClasseScolaireService) {}

  //Créer une classe liée à un niveau scolaire
  @Post('niveaux-scolaires/:niveauscolaireId/classes-scolaires')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une classe liée à un niveau scolaire' })
  @ApiParam({
    name: 'niveauscolaireId',
    description: 'ID du niveau scolaire (UUID)',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @ApiResponse({
    status: 201,
    description: 'La classe scolaire a été créée avec succès.',
  })
  @ApiResponse({
    status: 404,
    description: 'Niveau scolaire introuvable.',
  })
  @ApiResponse({
    status: 409,
    description: 'La classe existe déjà pour ce niveau scolaire.',
  })
  create(
    @Param('niveauscolaireId') niveauscolaireId: string,
    @Body() dto: CreateClasseScolaireDto,
  ) {
    return this.classeScolaireService.create(niveauscolaireId, dto);
  }

  //Lister toutes les classes de ce niveau scolaire
  @Get('niveaux-scolaires/:niveauscolaireId/classes-scolaires')
  @ApiOperation({ summary: 'Lister toutes les classes de ce niveau scolaire' })
  @ApiParam({
    name: 'niveauscolaireId',
    description: 'ID du niveau scolaire (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des classes récupérée avec succès.',
  })
  findAllByNiveau(
    @Param('niveauscolaireId') niveauscolaireId: string,
    @Query() query: QueryClasseScolaireDto,
  ) {
    return this.classeScolaireService.findAllByNiveau(niveauscolaireId, query);
  }

  //Lister toutes les classes d'une école (tous niveaux confondus)
  @Get('ecoles/:ecoleId/classes-scolaires')
  @ApiOperation({
    summary: "Lister toutes les classes d'une école (tous niveaux confondus)",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID de l'école (UUID)",
  })
  @ApiResponse({
    status: 200,
    description: "Liste globale des classes de l'école récupérée avec succès.",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Cette école n'existe pas.",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: ' Cette école ne possède pas de classeScolaire',
  })
  findAllByEcole(
    @Param('ecoleId') ecoleId: string,
    @Query() query: QueryClasseScolaireDto,
  ) {
    return this.classeScolaireService.findAllByEcole(ecoleId, query);
  }

  //Récupérer une classe spécifique d’un niveau
  @Get(
    'niveaux-scolaires/:niveauscolaireId/classes-scolaires/:classeScolaireId',
  )
  @ApiOperation({ summary: 'Récupérer une classe spécifique d’un niveau' })
  @ApiParam({
    name: 'niveauscolaireId',
    description: 'ID du niveau scolaire (UUID)',
  })
  @ApiParam({
    name: 'classeScolaireId',
    description: 'ID de la classe scolaire (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Détails de la classe scolaire.',
  })
  @ApiResponse({
    status: 404,
    description: 'Classe scolaire introuvable pour ce niveau.',
  })
  findOne(
    @Param('niveauscolaireId') niveauscolaireId: string,
    @Param('classeScolaireId') classeScolaireId: string,
  ) {
    return this.classeScolaireService.findOne(
      niveauscolaireId,
      classeScolaireId,
    );
  }

  //Mettre à jour une classe scolaire
  @Patch(
    'niveaux-scolaires/:niveauscolaireId/classes-scolaires/:classeScolaireId',
  )
  @ApiOperation({ summary: 'Mettre à jour une classe scolaire' })
  @ApiParam({
    name: 'niveauscolaireId',
    description: 'ID du niveau scolaire (UUID)',
  })
  @ApiParam({
    name: 'classeScolaireId',
    description: 'ID de la classe scolaire (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Classe scolaire mise à jour avec succès.',
  })
  @ApiResponse({
    status: 404,
    description: 'Classe scolaire introuvable.',
  })
  update(
    @Param('niveauscolaireId') niveauscolaireId: string,
    @Param('classeScolaireId') classeScolaireId: string,
    @Body() dto: UpdateClasseScolaireDto,
  ) {
    return this.classeScolaireService.update(
      niveauscolaireId,
      classeScolaireId,
      dto,
    );
  }

  //Supprimer une classe scolaire
  @Delete(
    'niveaux-scolaires/:niveauscolaireId/classes-scolaires/:classeScolaireId',
  )
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une classe scolaire' })
  @ApiParam({
    name: 'niveauscolaireId',
    description: 'ID du niveau scolaire (UUID)',
  })
  @ApiParam({
    name: 'classeScolaireId',
    description: 'ID de la classe scolaire (UUID)',
  })
  @ApiResponse({
    status: 204,
    description: 'Classe scolaire supprimée avec succès.',
  })
  @ApiResponse({
    status: 404,
    description: 'Classe scolaire introuvable.',
  })
  remove(
    @Param('niveauscolaireId') niveauscolaireId: string,
    @Param('classeScolaireId') classeScolaireId: string,
  ) {
    return this.classeScolaireService.remove(
      niveauscolaireId,
      classeScolaireId,
    );
  }
}
