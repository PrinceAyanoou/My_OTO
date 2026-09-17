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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { NiveauScolaireService } from './niveau-scolaire.service';
import {
  CreateNiveauScolaireDto,
  UpdateNiveauScolaireDto,
  QueryNiveauScolaireDto,
} from './dto/niveau-scolaire.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';
import { CheckPolicies } from '../auth/decorators/check-permissions.decorator';
import {
  permission_action,
  permission_cible,
} from 'src/generated/prisma/client';

@ApiTags('Niveaux Scolaires')
@ApiBearerAuth()
@ApiParam({
  name: 'ecoleId',
  description: "ID de l'école (UUID)",
  example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
})
@Controller('ecoles/:ecoleId/niveaux-scolaires')
@UseGuards(ClerkAuthGuard, PoliciesGuard)
@UsePipes(ZodValidationPipe)
export class NiveauScolaireController {
  constructor(private readonly niveauScolaireService: NiveauScolaireService) {}

  //créer un niveau scolaire.
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies((ability) =>
    ability.can(permission_action.CREATE, permission_cible.niveauScolaire),
  )
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
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Body() dto: CreateNiveauScolaireDto,
  ) {
    return this.niveauScolaireService.create(ecoleId, dto);
  }

  //lister tous les niveaux scolaires.
  @Get()
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.niveauScolaire),
  )
  @ApiOperation({ summary: "Lister tous les niveaux scolaires d'une école" })
  @ApiResponse({
    status: 200,
    description: 'Liste des niveaux scolaires récupérée.',
  })
  findAllByEcole(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Query() query: QueryNiveauScolaireDto,
  ) {
    return this.niveauScolaireService.findAllByEcole(ecoleId, query);
  }

  //récupérer un niveau scolaire spécifique
  @Get(':niveauscolaireId')
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.niveauScolaire),
  )
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
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('niveauscolaireId', ParseUUIDPipe) niveauscolaireId: string,
  ) {
    return this.niveauScolaireService.findOne(ecoleId, niveauscolaireId);
  }

  //mettre à jour un niveua scolaire.
  @Patch(':niveauscolaireId')
  @CheckPolicies((ability) =>
    ability.can(permission_action.UPDATE, permission_cible.niveauScolaire),
  )
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
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('niveauscolaireId', ParseUUIDPipe) niveauscolaireId: string,
    @Body() dto: UpdateNiveauScolaireDto,
  ) {
    return this.niveauScolaireService.update(ecoleId, niveauscolaireId, dto);
  }

  //supprimer un niveau scolaire.
  @Delete(':niveauscolaireId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @CheckPolicies((ability) =>
    ability.can(permission_action.DELETE, permission_cible.niveauScolaire),
  )
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
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('niveauscolaireId', ParseUUIDPipe) niveauscolaireId: string,
  ) {
    return this.niveauScolaireService.remove(ecoleId, niveauscolaireId);
  }
}
