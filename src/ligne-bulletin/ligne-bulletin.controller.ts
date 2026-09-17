import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { LigneBulletinService } from './ligne-bulletin.service';

import {
  CreateLigneBulletinDto,
  UpdateLigneBulletinDto,
} from './dto/ligne-bulletin.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';
import { CheckPolicies } from '../auth/decorators/check-permissions.decorator';
import {
  permission_action,
  permission_cible,
} from 'src/generated/prisma/client';

@ApiTags('Lignes de bulletin')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, PoliciesGuard)
@Controller('ecoles/:ecoleId/ligne-bulletin')
export class LigneBulletinController {
  constructor(private readonly ligneBulletinService: LigneBulletinService) {}

  //Créer une ligne de bulletin
  @Post()
  @CheckPolicies((ability) =>
    ability.can(permission_action.CREATE, permission_cible.ligneBulletin),
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer une ligne de bulletin',
    description:
      'Ajoute une matière, sa moyenne et son coefficient au bulletin d’un apprenant.',
  })
  @ApiBody({
    type: CreateLigneBulletinDto,
    description: 'Données nécessaires pour créer une ligne de bulletin',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'La ligne de bulletin a été créée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Le bulletin ou la matière indiquée est introuvable.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'La matière n’est pas associée à la classe ou existe déjà dans le bulletin.',
  })
  async create(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Body() dto: CreateLigneBulletinDto,
  ) {
    return this.ligneBulletinService.create(dto, ecoleId);
  }

  //Récupérer toutes les lignes de bulletin
  @Get()
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.ligneBulletin),
  )
  @ApiOperation({
    summary: 'Récupérer toutes les lignes de bulletin',
    description: 'Retourne toutes les lignes de bulletin enregistrées.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des lignes de bulletin récupérée avec succès.',
  })
  async findAll(@Param('ecoleId', ParseUUIDPipe) ecoleId: string) {
    return this.ligneBulletinService.findAll(ecoleId);
  }

  //Récupérer toutes les lignes d'un bulletin
  @Get('bulletin/:bulletinApprenantId/:bulletinAnneeId/:bulletinId')
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.ligneBulletin),
  )
  @ApiOperation({
    summary: 'Récupérer les lignes d’un bulletin',
    description:
      'Retourne toutes les matières, moyennes et coefficients associés à un bulletin précis.',
  })
  @ApiParam({
    name: 'bulletinApprenantId',
    description: 'ID de l’apprenant',
    type: String,
    format: 'uuid',
  })
  @ApiParam({
    name: 'bulletinAnneeId',
    description: 'ID de l’année scolaire',
    type: String,
    format: 'uuid',
  })
  @ApiParam({
    name: 'bulletinId',
    description: 'ID de la période scolaire',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Les lignes du bulletin ont été récupérées avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Le bulletin indiqué est introuvable.',
  })
  async findByBulletin(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('bulletinApprenantId', ParseUUIDPipe)
    bulletinApprenantId: string,

    @Param('bulletinAnneeId', ParseUUIDPipe)
    bulletinAnneeId: string,

    @Param('bulletinId', ParseUUIDPipe)
    bulletinId: string,
  ) {
    return this.ligneBulletinService.findByBulletin(
      bulletinApprenantId,
      bulletinAnneeId,
      bulletinId,
      ecoleId,
    );
  }

  // Récupérer une ligne précise
  @Get(':bulletinApprenantId/:bulletinAnneeId/:bulletinId/:matiereId')
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.ligneBulletin),
  )
  @ApiOperation({
    summary: 'Récupérer une ligne de bulletin',
    description:
      'Retourne une ligne de bulletin correspondant à une matière précise.',
  })
  @ApiParam({
    name: 'bulletinApprenantId',
    description: 'ID de l’apprenant',
    type: String,
    format: 'uuid',
  })
  @ApiParam({
    name: 'bulletinAnneeId',
    description: 'ID de l’année scolaire',
    type: String,
    format: 'uuid',
  })
  @ApiParam({
    name: 'bulletinId',
    description: 'ID de la période scolaire',
    type: String,
    format: 'uuid',
  })
  @ApiParam({
    name: 'matiereId',
    description: 'ID de la matière',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'La ligne de bulletin a été récupérée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'La ligne de bulletin est introuvable.',
  })
  async findOne(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('bulletinApprenantId', ParseUUIDPipe)
    bulletinApprenantId: string,

    @Param('bulletinAnneeId', ParseUUIDPipe)
    bulletinAnneeId: string,

    @Param('bulletinId', ParseUUIDPipe)
    bulletinId: string,

    @Param('matiereId', ParseUUIDPipe)
    matiereId: string,
  ) {
    return this.ligneBulletinService.findOne(
      bulletinApprenantId,
      bulletinAnneeId,
      bulletinId,
      matiereId,
      ecoleId,
    );
  }

  //Modifier une ligne de bulletin
  @Patch(':bulletinApprenantId/:bulletinAnneeId/:bulletinId/:matiereId')
  @CheckPolicies((ability) =>
    ability.can(permission_action.UPDATE, permission_cible.ligneBulletin),
  )
  @ApiOperation({
    summary: 'Modifier une ligne de bulletin',
    description: 'Modifie la moyenne d’une matière dans un bulletin.',
  })
  @ApiParam({
    name: 'bulletinApprenantId',
    description: 'ID de l’apprenant',
    type: String,
    format: 'uuid',
  })
  @ApiParam({
    name: 'bulletinAnneeId',
    description: 'ID de l’année scolaire',
    type: String,
    format: 'uuid',
  })
  @ApiParam({
    name: 'bulletinId',
    description: 'ID de la période scolaire',
    type: String,
    format: 'uuid',
  })
  @ApiParam({
    name: 'matiereId',
    description: 'ID de la matière',
    type: String,
    format: 'uuid',
  })
  @ApiBody({
    type: UpdateLigneBulletinDto,
    description: 'Données à modifier',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'La ligne de bulletin a été modifiée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'La ligne de bulletin est introuvable.',
  })
  async update(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('bulletinApprenantId', ParseUUIDPipe)
    bulletinApprenantId: string,

    @Param('bulletinAnneeId', ParseUUIDPipe)
    bulletinAnneeId: string,

    @Param('bulletinId', ParseUUIDPipe)
    bulletinId: string,

    @Param('matiereId', ParseUUIDPipe)
    matiereId: string,

    @Body() dto: UpdateLigneBulletinDto,
  ) {
    return this.ligneBulletinService.update(
      bulletinApprenantId,
      bulletinAnneeId,
      bulletinId,
      matiereId,
      dto,
      ecoleId,
    );
  }

  // Supprimer une ligne de bulletin
  @Delete(':bulletinApprenantId/:bulletinAnneeId/:bulletinId/:matiereId')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.DELETE, permission_cible.ligneBulletin),
  )
  @ApiOperation({
    summary: 'Supprimer une ligne de bulletin',
    description: 'Supprime une matière de la liste des lignes d’un bulletin.',
  })
  @ApiParam({
    name: 'bulletinApprenantId',
    description: 'ID de l’apprenant',
    type: String,
    format: 'uuid',
  })
  @ApiParam({
    name: 'bulletinAnneeId',
    description: 'ID de l’année scolaire',
    type: String,
    format: 'uuid',
  })
  @ApiParam({
    name: 'bulletinId',
    description: 'ID de la période scolaire',
    type: String,
    format: 'uuid',
  })
  @ApiParam({
    name: 'matiereId',
    description: 'ID de la matière',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'La ligne de bulletin a été supprimée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'La ligne de bulletin est introuvable.',
  })
  async remove(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('bulletinApprenantId', ParseUUIDPipe)
    bulletinApprenantId: string,

    @Param('bulletinAnneeId', ParseUUIDPipe)
    bulletinAnneeId: string,

    @Param('bulletinId', ParseUUIDPipe)
    bulletinId: string,

    @Param('matiereId', ParseUUIDPipe)
    matiereId: string,
  ) {
    return this.ligneBulletinService.remove(
      bulletinApprenantId,
      bulletinAnneeId,
      bulletinId,
      matiereId,
      ecoleId,
    );
  }
}
