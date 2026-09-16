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
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';

import { BulletinService } from './bulletin.service';
import {
  CreateBulletinDto,
  GenerateBulletinPdfDto,
  UpdateBulletinDto,
} from './dto/bulletin.dto';

import { ClerkAuthGuard } from 'src/auth/guards/clerk-auth.guard';
import { PoliciesGuard } from 'src/auth/guards/permissions.guard';
import { CheckPolicies } from 'src/auth/decorators/check-permissions.decorator';
import {
  permission_action,
  permission_cible,
} from 'src/generated/prisma/client';

@ApiTags('Bulletins')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, PoliciesGuard)
@UsePipes(ZodValidationPipe)
@Controller('bulletins')
export class BulletinController {
  constructor(private readonly bulletinService: BulletinService) {}

  // CRÉER UN BULLETIN
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies((ability) =>
    ability.can(permission_action.CREATE, permission_cible.bulletin),
  )
  @ApiOperation({
    summary: 'Créer un nouveau bulletin',
    description:
      'Calcule la moyenne générale et crée le bulletin d’un apprenant pour une période scolaire donnée.',
  })
  @ApiBody({
    type: CreateBulletinDto,
    description: 'Données nécessaires à la création du bulletin.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Le bulletin a été créé avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données transmises invalides.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Droits insuffisants pour effectuer cette action.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description:
      'L’inscription de l’apprenant ou la période scolaire est introuvable.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Un bulletin existe déjà pour cet apprenant et cette période.',
  })
  async create(@Body() createBulletinDto: CreateBulletinDto) {
    return this.bulletinService.create(createBulletinDto);
  }

  // RÉCUPÉRER TOUS LES BULLETINS
  @Get()
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.bulletin),
  )
  @ApiOperation({
    summary: 'Récupérer tous les bulletins',
    description:
      'Retourne la liste de tous les bulletins enregistrés dans le système.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des bulletins récupérée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Droits insuffisants pour effectuer cette action.',
  })
  async findAll() {
    return this.bulletinService.findAll();
  }

  // RÉCUPÉRER UN BULLETIN
  @Get(':inscriptionApprenantId/:inscriptionAnneeId/:periodeScolaireId')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.bulletin),
  )
  @ApiOperation({
    summary: 'Récupérer un bulletin spécifique',
    description:
      'Recherche un bulletin à partir de la clé composite composée de l’apprenant, de l’année scolaire et de la période scolaire.',
  })
  @ApiParam({
    name: 'inscriptionApprenantId',
    description: 'ID UUID de l’apprenant.',
    type: String,
  })
  @ApiParam({
    name: 'inscriptionAnneeId',
    description: 'ID UUID de l’année scolaire.',
    type: String,
  })
  @ApiParam({
    name: 'periodeScolaireId',
    description: 'ID UUID de la période scolaire.',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bulletin trouvé avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Droits insuffisants pour effectuer cette action.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Bulletin introuvable.',
  })
  async findOne(
    @Param('inscriptionApprenantId', ParseUUIDPipe)
    inscriptionApprenantId: string,

    @Param('inscriptionAnneeId', ParseUUIDPipe)
    inscriptionAnneeId: string,

    @Param('periodeScolaireId', ParseUUIDPipe)
    periodeScolaireId: string,
  ) {
    return this.bulletinService.findOne(
      inscriptionApprenantId,
      inscriptionAnneeId,
      periodeScolaireId,
    );
  }

  // MODIFIER UN BULLETIN
  @Patch(':inscriptionApprenantId/:inscriptionAnneeId/:periodeScolaireId')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.UPDATE, permission_cible.bulletin),
  )
  @ApiOperation({
    summary: 'Mettre à jour un bulletin',
    description:
      'Permet de modifier l’appréciation et/ou la décision de fin d’année d’un bulletin.',
  })
  @ApiParam({
    name: 'inscriptionApprenantId',
    description: 'ID UUID de l’apprenant.',
  })
  @ApiParam({
    name: 'inscriptionAnneeId',
    description: 'ID UUID de l’année scolaire.',
  })
  @ApiParam({
    name: 'periodeScolaireId',
    description: 'ID UUID de la période scolaire.',
  })
  @ApiBody({
    type: UpdateBulletinDto,
    description: 'Données à modifier dans le bulletin.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bulletin mis à jour avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données transmises invalides.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Droits insuffisants pour effectuer cette action.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Bulletin introuvable.',
  })
  async update(
    @Param('inscriptionApprenantId', ParseUUIDPipe)
    inscriptionApprenantId: string,

    @Param('inscriptionAnneeId', ParseUUIDPipe)
    inscriptionAnneeId: string,

    @Param('periodeScolaireId', ParseUUIDPipe)
    periodeScolaireId: string,

    @Body() updateBulletinDto: UpdateBulletinDto,
  ) {
    return this.bulletinService.update(
      inscriptionApprenantId,
      inscriptionAnneeId,
      periodeScolaireId,
      updateBulletinDto,
    );
  }

  // SUPPRIMER UN BULLETIN
  @Delete(':inscriptionApprenantId/:inscriptionAnneeId/:periodeScolaireId')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.DELETE, permission_cible.bulletin),
  )
  @ApiOperation({
    summary: 'Supprimer un bulletin',
    description:
      'Supprime définitivement un bulletin à partir de sa clé composite.',
  })
  @ApiParam({
    name: 'inscriptionApprenantId',
    description: 'ID UUID de l’apprenant.',
  })
  @ApiParam({
    name: 'inscriptionAnneeId',
    description: 'ID UUID de l’année scolaire.',
  })
  @ApiParam({
    name: 'periodeScolaireId',
    description: 'ID UUID de la période scolaire.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bulletin supprimé avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Droits insuffisants pour effectuer cette action.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Bulletin introuvable.',
  })
  async remove(
    @Param('inscriptionApprenantId', ParseUUIDPipe)
    inscriptionApprenantId: string,

    @Param('inscriptionAnneeId', ParseUUIDPipe)
    inscriptionAnneeId: string,

    @Param('periodeScolaireId', ParseUUIDPipe)
    periodeScolaireId: string,
  ) {
    return this.bulletinService.remove(
      inscriptionApprenantId,
      inscriptionAnneeId,
      periodeScolaireId,
    );
  }

  // GÉNÉRER LE PDF D'UN BULLETIN
  @Post('generate-pdf')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.UPDATE, permission_cible.bulletin),
  )
  @ApiOperation({
    summary: 'Générer le PDF d’un bulletin individuel',
    description:
      'Génère le PDF du bulletin, le téléverse sur Cloudinary, puis enregistre son URL dans la base de données.',
  })
  @ApiBody({
    type: GenerateBulletinPdfDto,
    description: 'Identifiants permettant d’identifier le bulletin à générer.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'PDF généré et téléversé sur Cloudinary avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données transmises invalides.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Droits insuffisants pour effectuer cette action.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description:
      'Bulletin ou données nécessaires à la génération introuvables.',
  })
  async generatePdf(@Body() dto: GenerateBulletinPdfDto) {
    return this.bulletinService.generatePdf(
      dto.inscriptionApprenantId,
      dto.inscriptionAnneeId,
      dto.periodeScolaireId,
    );
  }

  // GÉNÉRER TOUS LES BULLETINS D'UNE CLASSE
  @Post(
    'generate-pdf/classe/:classeScolaireId/:anneeScolaireId/:periodeScolaireId',
  )
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.UPDATE, permission_cible.bulletin),
  )
  @ApiOperation({
    summary: 'Générer tous les bulletins PDF d’une classe',
    description:
      'Génère le PDF de chaque apprenant inscrit dans une classe pour une année et une période scolaire données. Chaque PDF est sauvegardé sur Cloudinary.',
  })
  @ApiParam({
    name: 'classeScolaireId',
    description: 'ID UUID de la classe scolaire.',
    type: String,
  })
  @ApiParam({
    name: 'anneeScolaireId',
    description: 'ID UUID de l’année scolaire.',
    type: String,
  })
  @ApiParam({
    name: 'periodeScolaireId',
    description: 'ID UUID de la période scolaire.',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'La génération des bulletins de la classe est terminée. Le résultat indique le nombre de bulletins générés et les éventuels échecs.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Droits insuffisants pour effectuer cette action.',
  })
  async generateBulletinsForClasse(
    @Param('classeScolaireId', ParseUUIDPipe)
    classeScolaireId: string,

    @Param('anneeScolaireId', ParseUUIDPipe)
    anneeScolaireId: string,

    @Param('periodeScolaireId', ParseUUIDPipe)
    periodeScolaireId: string,
  ) {
    return this.bulletinService.generateBulletinsForClasse(
      classeScolaireId,
      anneeScolaireId,
      periodeScolaireId,
    );
  }

  // GÉNÉRER LES BULLETINS DE PLUSIEURS CLASSES
  @Post('generate-pdf/classes/:anneeScolaireId/:periodeScolaireId')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.UPDATE, permission_cible.bulletin),
  )
  @ApiOperation({
    summary: 'Générer les bulletins PDF de plusieurs classes',
    description:
      'Génère les bulletins PDF de tous les apprenants appartenant aux classes sélectionnées.',
  })
  @ApiParam({
    name: 'anneeScolaireId',
    description: 'ID UUID de l’année scolaire.',
    type: String,
  })
  @ApiParam({
    name: 'periodeScolaireId',
    description: 'ID UUID de la période scolaire.',
    type: String,
  })
  @ApiBody({
    description: 'Liste des identifiants UUID des classes à traiter.',
    schema: {
      type: 'object',
      properties: {
        classeScolaireIds: {
          type: 'array',
          items: {
            type: 'string',
            format: 'uuid',
          },
          example: [
            '550e8400-e29b-41d4-a716-446655440001',
            '550e8400-e29b-41d4-a716-446655440002',
          ],
        },
      },
      required: ['classeScolaireIds'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'La génération des bulletins des classes sélectionnées est terminée.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données transmises invalides.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Droits insuffisants pour effectuer cette action.',
  })
  async generateBulletinsForClasses(
    @Param('anneeScolaireId', ParseUUIDPipe)
    anneeScolaireId: string,

    @Param('periodeScolaireId', ParseUUIDPipe)
    periodeScolaireId: string,

    @Body('classeScolaireIds')
    classeScolaireIds: string[],
  ) {
    return this.bulletinService.generateBulletinsForClasses(
      classeScolaireIds,
      anneeScolaireId,
      periodeScolaireId,
    );
  }

  // GÉNÉRER TOUS LES BULLETINS DE L'ÉCOLE
  @Post('generate-pdf/ecole/:ecoleId/:anneeScolaireId/:periodeScolaireId')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.UPDATE, permission_cible.bulletin),
  )
  @ApiOperation({
    summary: 'Générer tous les bulletins PDF de l’école',
    description:
      'Récupère toutes les classes de l’école puis génère les bulletins PDF de tous les apprenants de ces classes. Chaque PDF est sauvegardé sur Cloudinary.',
  })
  @ApiParam({
    name: 'ecoleId',
    description: 'ID UUID de l’école.',
    type: String,
  })
  @ApiParam({
    name: 'anneeScolaireId',
    description: 'ID UUID de l’année scolaire.',
    type: String,
  })
  @ApiParam({
    name: 'periodeScolaireId',
    description: 'ID UUID de la période scolaire.',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'La génération globale des bulletins de l’école est terminée.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Droits insuffisants pour effectuer cette action.',
  })
  async generateBulletinsForSchool(
    @Param('ecoleId', ParseUUIDPipe)
    ecoleId: string,

    @Param('anneeScolaireId', ParseUUIDPipe)
    anneeScolaireId: string,

    @Param('periodeScolaireId', ParseUUIDPipe)
    periodeScolaireId: string,
  ) {
    return this.bulletinService.generateBulletinsForSchool(
      ecoleId,
      anneeScolaireId,
      periodeScolaireId,
    );
  }
}
