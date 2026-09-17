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
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

import { TrancheScolariteService } from './tranche-scolarite.service';
import {
  CreateTrancheScolariteDto,
  UpdateTrancheScolariteDto,
} from './dto/tranche-scolarite.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';
import { CheckPolicies } from '../auth/decorators/check-permissions.decorator';
import {
  permission_action,
  permission_cible,
} from 'src/generated/prisma/client';

@ApiTags('Tranches de scolarité')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, PoliciesGuard)
@Controller(
  'ecoles/:ecoleId/configurations-scolarite/:configurationScolariteId/tranches-scolarite',
)
export class TrancheScolariteController {
  constructor(
    private readonly trancheScolariteService: TrancheScolariteService,
  ) {}

  // Créer une tranche de scolarité
  @Post()
  @CheckPolicies((ability) =>
    ability.can(permission_action.CREATE, permission_cible.trancheScolarite),
  )
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
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('configurationScolariteId', ParseUUIDPipe)
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
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.trancheScolarite),
  )
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
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('configurationScolariteId', ParseUUIDPipe)
    configurationScolariteId: string,
  ) {
    return this.trancheScolariteService.findAll(
      ecoleId,
      configurationScolariteId,
    );
  }

  //Récupérer une tranche de scolarité

  @Get(':id')
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.trancheScolarite),
  )
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
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('configurationScolariteId', ParseUUIDPipe)
    configurationScolariteId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.trancheScolariteService.findOne(
      ecoleId,
      configurationScolariteId,
      id,
    );
  }

  // Modifier une tranche de scolarité

  @Patch(':id')
  @CheckPolicies((ability) =>
    ability.can(permission_action.UPDATE, permission_cible.trancheScolarite),
  )
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
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('configurationScolariteId', ParseUUIDPipe)
    configurationScolariteId: string,
    @Param('id', ParseUUIDPipe) id: string,
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
  @CheckPolicies((ability) =>
    ability.can(permission_action.DELETE, permission_cible.trancheScolarite),
  )
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
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('configurationScolariteId', ParseUUIDPipe)
    configurationScolariteId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.trancheScolariteService.remove(
      ecoleId,
      configurationScolariteId,
      id,
    );
  }
}
