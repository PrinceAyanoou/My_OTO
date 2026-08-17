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
import { NiveauScolaireService } from './niveau-scolaire.service';
import {
  CreateNiveauScolaireDto,
  UpdateNiveauScolaireDto,
  QueryNiveauScolaireDto,
} from './dto/niveau-scolaire.dto';

@ApiTags('Niveaux Scolaires')
@ApiParam({
  name: 'ecoleId',
  description: "ID de l'école (UUID)",
  example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
})
@Controller('ecoles/:ecoleId/niveaux-scolaires')
@UsePipes(ZodValidationPipe)
export class NiveauScolaireController {
  constructor(private readonly niveauScolaireService: NiveauScolaireService) {}

  //créer un niveau scolaire.
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un niveau scolaire pour une école' })
  @ApiResponse({
    status: 201,
    description: 'Le niveau scolaire a été créé avec succès.',
  })
  @ApiResponse({
    status: 409,
    description: 'Le niveau scolaire existe déjà pour cette école.',
  })
  @ApiResponse({
    status: 400,
    description: 'Données de requête invalides (validation Zod).',
  })
  create(
    @Param('ecoleId') ecoleId: string,
    @Body() dto: CreateNiveauScolaireDto,
  ) {
    return this.niveauScolaireService.create(ecoleId, dto);
  }

  //lister tous les niveaux scolaires.
  @Get()
  @ApiOperation({ summary: "Lister tous les niveaux scolaires d'une école" })
  @ApiResponse({
    status: 200,
    description: 'Liste des niveaux scolaires récupérée.',
  })
  findAllByEcole(
    @Param('ecoleId') ecoleId: string,
    @Query() query: QueryNiveauScolaireDto,
  ) {
    return this.niveauScolaireService.findAllByEcole(ecoleId, query);
  }

  //récupérer un niveau scolaire spécifique
  @Get(':niveauscolaireId')
  @ApiOperation({ summary: 'Récupérer un niveau scolaire spécifique' })
  @ApiParam({
    name: 'niveauscolaireId',
    description: 'ID du niveau scolaire (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Détails du niveau scolaire.',
  })
  @ApiResponse({
    status: 404,
    description: 'Niveau scolaire introuvable pour cette école.',
  })
  findOne(
    @Param('ecoleId') ecoleId: string,
    @Param('niveauscolaireId') niveauscolaireId: string,
  ) {
    return this.niveauScolaireService.findOne(ecoleId, niveauscolaireId);
  }

  //mettre à jour un niveua scolaire.
  @Patch(':niveauscolaireId')
  @ApiOperation({ summary: 'Mettre à jour un niveau scolaire' })
  @ApiParam({
    name: 'niveauscolaireId',
    description: 'ID du niveau scolaire (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Niveau scolaire mis à jour.',
  })
  @ApiResponse({
    status: 404,
    description: 'Niveau scolaire introuvable.',
  })
  update(
    @Param('ecoleId') ecoleId: string,
    @Param('niveauscolaireId') niveauscolaireId: string,
    @Body() dto: UpdateNiveauScolaireDto,
  ) {
    return this.niveauScolaireService.update(ecoleId, niveauscolaireId, dto);
  }

  //supprimer un niveau scolaire.
  @Delete(':niveauscolaireId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un niveau scolaire' })
  @ApiParam({
    name: 'niveauscolaireId',
    description: 'ID du niveau scolaire (UUID)',
  })
  @ApiResponse({
    status: 204,
    description: 'Niveau scolaire supprimé.',
  })
  @ApiResponse({
    status: 404,
    description: 'Niveau scolaire introuvable.',
  })
  remove(
    @Param('ecoleId') ecoleId: string,
    @Param('niveauscolaireId') niveauscolaireId: string,
  ) {
    return this.niveauScolaireService.remove(ecoleId, niveauscolaireId);
  }
}
