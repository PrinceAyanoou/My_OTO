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
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { ClasseScolaireService } from './classe-scolaire.service';
import {
  CreateClasseScolaireDto,
  UpdateClasseScolaireDto,
  QueryClasseScolaireDto,
} from './dto/classe-scolaire.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';
import { CheckPolicies } from '../auth/decorators/check-permissions.decorator';
import { AppAbility } from '../auth/casl/casl-ability.factory/casl-ability.factory';
import {
  permission_action,
  permission_cible,
} from 'src/generated/prisma/client';

@ApiTags('Classes Scolaires')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, PoliciesGuard)
@UsePipes(ZodValidationPipe)
@Controller()
export class ClasseScolaireController {
  constructor(private readonly classeScolaireService: ClasseScolaireService) {}

  @Post('niveaux-scolaires/:niveauscolaireId/classes-scolaires')
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(permission_action.CREATE, permission_cible.classeScolaire),
  )
  @ApiOperation({ summary: 'Créer une classe liée à un niveau scolaire' })
  @ApiParam({
    name: 'niveauscolaireId',
    description: 'ID du niveau scolaire (UUID)',
  })
  @ApiResponse({
    status: 201,
    description: 'La classe scolaire a été créée avec succès.',
  })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès interdit.' })
  @ApiResponse({ status: 404, description: 'Niveau scolaire introuvable.' })
  @ApiResponse({
    status: 409,
    description: 'La classe existe déjà pour ce niveau scolaire.',
  })
  create(
    @Param('niveauscolaireId', ParseUUIDPipe) niveauscolaireId: string,
    @Body() dto: CreateClasseScolaireDto,
  ) {
    return this.classeScolaireService.create(niveauscolaireId, dto);
  }

  @Get('niveaux-scolaires/:niveauscolaireId/classes-scolaires')
  @CheckPolicies((ability: AppAbility) =>
    ability.can(permission_action.READ, permission_cible.classeScolaire),
  )
  @ApiOperation({ summary: 'Lister toutes les classes d’un niveau scolaire' })
  @ApiParam({
    name: 'niveauscolaireId',
    description: 'ID du niveau scolaire (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des classes récupérée avec succès.',
  })
  findAllByNiveau(
    @Param('niveauscolaireId', ParseUUIDPipe) niveauscolaireId: string,
    @Query() query: QueryClasseScolaireDto,
  ) {
    return this.classeScolaireService.findAllByNiveau(niveauscolaireId, query);
  }

  @Get('ecoles/:ecoleId/classes-scolaires')
  @CheckPolicies((ability: AppAbility) =>
    ability.can(permission_action.READ, permission_cible.classeScolaire),
  )
  @ApiOperation({ summary: "Lister toutes les classes d'une école" })
  @ApiParam({ name: 'ecoleId', description: "ID de l'école (UUID)" })
  @ApiResponse({
    status: 200,
    description: 'Liste globale récupérée avec succès.',
  })
  @ApiResponse({ status: 404, description: "Cette école n'existe pas." })
  findAllByEcole(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Query() query: QueryClasseScolaireDto,
  ) {
    return this.classeScolaireService.findAllByEcole(ecoleId, query);
  }

  @Get(
    'niveaux-scolaires/:niveauscolaireId/classes-scolaires/:classeScolaireId',
  )
  @CheckPolicies((ability: AppAbility) =>
    ability.can(permission_action.READ, permission_cible.classeScolaire),
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
  @ApiResponse({ status: 200, description: 'Détails de la classe scolaire.' })
  @ApiResponse({ status: 404, description: 'Classe scolaire introuvable.' })
  findOne(
    @Param('niveauscolaireId', ParseUUIDPipe) niveauscolaireId: string,
    @Param('classeScolaireId', ParseUUIDPipe) classeScolaireId: string,
  ) {
    return this.classeScolaireService.findOne(
      niveauscolaireId,
      classeScolaireId,
    );
  }

  @Patch(
    'niveaux-scolaires/:niveauscolaireId/classes-scolaires/:classeScolaireId',
  )
  @CheckPolicies((ability: AppAbility) =>
    ability.can(permission_action.UPDATE, permission_cible.classeScolaire),
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
  @ApiResponse({ status: 200, description: 'Classe mise à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Classe introuvable.' })
  @ApiResponse({
    status: 409,
    description: 'Une classe porte déjà ce nom dans ce niveau.',
  })
  update(
    @Param('niveauscolaireId', ParseUUIDPipe) niveauscolaireId: string,
    @Param('classeScolaireId', ParseUUIDPipe) classeScolaireId: string,
    @Body() dto: UpdateClasseScolaireDto,
  ) {
    return this.classeScolaireService.update(
      niveauscolaireId,
      classeScolaireId,
      dto,
    );
  }

  @Delete(
    'niveaux-scolaires/:niveauscolaireId/classes-scolaires/:classeScolaireId',
  )
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(permission_action.DELETE, permission_cible.classeScolaire),
  )
  @ApiOperation({ summary: 'Supprimer une classe scolaire' })
  @ApiParam({
    name: 'niveauscolaireId',
    description: 'ID du niveau scolaire (UUID)',
  })
  @ApiParam({
    name: 'classeScolaireId',
    description: 'ID de la classe scolaire (UUID)',
  })
  @ApiResponse({ status: 200, description: 'Classe supprimée avec succès.' })
  @ApiResponse({ status: 404, description: 'Classe introuvable.' })
  remove(
    @Param('niveauscolaireId', ParseUUIDPipe) niveauscolaireId: string,
    @Param('classeScolaireId', ParseUUIDPipe) classeScolaireId: string,
  ) {
    return this.classeScolaireService.remove(
      niveauscolaireId,
      classeScolaireId,
    );
  }
}
