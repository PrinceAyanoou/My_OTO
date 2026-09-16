import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import { TrancheScolariteService } from './tranche-scolarite.service';
import {
  CreateTrancheScolariteDto,
  UpdateTrancheScolariteDto,
} from './dto/tranche-scolarite.dto';

@ApiTags('Tranches de scolarité')
@Controller(
  'ecoles/:ecoleId/configurations-scolarite/:configurationScolariteId/tranches-scolarite',
)
export class TrancheScolariteController {
  constructor(
    private readonly trancheScolariteService: TrancheScolariteService,
  ) {}

  // Créer une tranche de scolarité
  @Post()
  @ApiOperation({
    summary: 'Créer une tranche de scolarité',
    description:
      "Crée une tranche de scolarité dans une configuration appartenant à l'école indiquée.",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "Identifiant de l'école",
    example: 'clxxxxxxxxxxxxxxxx',
  })
  @ApiParam({
    name: 'configurationScolariteId',
    description: 'Identifiant de la configuration de scolarité',
    example: 'clxxxxxxxxxxxxxxxx',
  })
  @ApiResponse({
    status: 201,
    description: 'Tranche de scolarité créée avec succès.',
  })
  @ApiResponse({
    status: 404,
    description:
      "École ou configuration de scolarité introuvable, ou configuration n'appartenant pas à l'école.",
  })
  @ApiResponse({
    status: 409,
    description:
      'Une tranche avec le même ordre existe déjà dans cette configuration.',
  })
  async create(
    @Param('ecoleId') ecoleId: string,
    @Param('configurationScolariteId')
    configurationScolariteId: string,
    @Body() dto: CreateTrancheScolariteDto,
  ) {
    return this.trancheScolariteService.create(
      ecoleId,
      configurationScolariteId,
      dto,
    );
  }

  // Récupérer toutes les tranches d'une configuration

  @Get()
  @ApiOperation({
    summary: "Récupérer toutes les tranches d'une configuration",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "Identifiant de l'école",
    example: 'clxxxxxxxxxxxxxxxx',
  })
  @ApiParam({
    name: 'configurationScolariteId',
    description: 'Identifiant de la configuration de scolarité',
    example: 'clxxxxxxxxxxxxxxxx',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des tranches de scolarité.',
  })
  @ApiResponse({
    status: 404,
    description: 'École ou configuration de scolarité introuvable.',
  })
  async findAll(
    @Param('ecoleId') ecoleId: string,
    @Param('configurationScolariteId')
    configurationScolariteId: string,
  ) {
    return this.trancheScolariteService.findAll(
      ecoleId,
      configurationScolariteId,
    );
  }

  //Récupérer une tranche de scolarité

  @Get(':id')
  @ApiOperation({
    summary: 'Récupérer une tranche de scolarité',
  })
  @ApiParam({
    name: 'ecoleId',
    description: "Identifiant de l'école",
    example: 'clxxxxxxxxxxxxxxxx',
  })
  @ApiParam({
    name: 'configurationScolariteId',
    description: 'Identifiant de la configuration de scolarité',
    example: 'clxxxxxxxxxxxxxxxx',
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant de la tranche de scolarité',
    example: 'clxxxxxxxxxxxxxxxx',
  })
  @ApiResponse({
    status: 200,
    description: 'Tranche de scolarité trouvée.',
  })
  @ApiResponse({
    status: 404,
    description:
      "Tranche introuvable ou n'appartenant pas à cette configuration.",
  })
  async findOne(
    @Param('ecoleId') ecoleId: string,
    @Param('configurationScolariteId')
    configurationScolariteId: string,
    @Param('id') id: string,
  ) {
    return this.trancheScolariteService.findOne(
      ecoleId,
      configurationScolariteId,
      id,
    );
  }

  // Modifier une tranche de scolarité

  @Patch(':id')
  @ApiOperation({
    summary: 'Modifier une tranche de scolarité',
  })
  @ApiParam({
    name: 'ecoleId',
    description: "Identifiant de l'école",
    example: 'clxxxxxxxxxxxxxxxx',
  })
  @ApiParam({
    name: 'configurationScolariteId',
    description: 'Identifiant de la configuration de scolarité',
    example: 'clxxxxxxxxxxxxxxxx',
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant de la tranche de scolarité',
    example: 'clxxxxxxxxxxxxxxxx',
  })
  @ApiResponse({
    status: 200,
    description: 'Tranche de scolarité modifiée avec succès.',
  })
  @ApiResponse({
    status: 404,
    description: 'Tranche introuvable.',
  })
  @ApiResponse({
    status: 409,
    description: 'Une autre tranche possède déjà cet ordre.',
  })
  async update(
    @Param('ecoleId') ecoleId: string,
    @Param('configurationScolariteId')
    configurationScolariteId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTrancheScolariteDto,
  ) {
    return this.trancheScolariteService.update(
      ecoleId,
      configurationScolariteId,
      id,
      dto,
    );
  }

  //Supprimer une tranche de scolarité
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer une tranche de scolarité',
  })
  @ApiParam({
    name: 'ecoleId',
    description: "Identifiant de l'école",
    example: 'clxxxxxxxxxxxxxxxx',
  })
  @ApiParam({
    name: 'configurationScolariteId',
    description: 'Identifiant de la configuration de scolarité',
    example: 'clxxxxxxxxxxxxxxxx',
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant de la tranche de scolarité',
    example: 'clxxxxxxxxxxxxxxxx',
  })
  @ApiResponse({
    status: 200,
    description: 'Tranche de scolarité supprimée avec succès.',
  })
  @ApiResponse({
    status: 404,
    description: 'Tranche introuvable.',
  })
  async remove(
    @Param('ecoleId') ecoleId: string,
    @Param('configurationScolariteId')
    configurationScolariteId: string,
    @Param('id') id: string,
  ) {
    return this.trancheScolariteService.remove(
      ecoleId,
      configurationScolariteId,
      id,
    );
  }
}
