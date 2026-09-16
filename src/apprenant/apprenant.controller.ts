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
import { ApprenantService } from './apprenant.service';
import {
  CreateApprenantDto,
  UpdateApprenantDto,
  QueryApprenantDto,
} from './dto/apprenant.dto';
import { ClerkAuthGuard } from 'src/auth/guards/clerk-auth.guard';
import { PoliciesGuard } from 'src/auth/guards/permissions.guard';
import { CheckPolicies } from 'src/auth/decorators/check-permissions.decorator';
import {
  permission_action,
  permission_cible,
} from 'src/generated/prisma/client';

@ApiTags('Apprenants')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, PoliciesGuard)
@UsePipes(ZodValidationPipe)
@Controller('ecoles/:ecoleId/apprenants')
export class ApprenantController {
  constructor(private readonly apprenantService: ApprenantService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies((ability) =>
    ability.can(permission_action.CREATE, permission_cible.apprenant),
  )
  @ApiOperation({
    summary: "Créer un apprenant et l'inscrire",
    description:
      "Crée l'apprenant, son compte utilisateur (avec invitation Clerk si email présent) et effectue son inscription initiale.",
  })
  @ApiParam({ name: 'ecoleId', description: "ID unique (UUID) de l'école" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "L'apprenant et son inscription ont été créés avec succès.",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "La classe ou la configuration ne correspond pas à l'école.",
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
    description: 'École, classe ou année scolaire introuvable.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "Le matricule ou l'email existe déjà.",
  })
  create(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Body() dto: CreateApprenantDto,
  ) {
    return this.apprenantService.create(dto, ecoleId);
  }

  @Get()
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.apprenant),
  )
  @ApiOperation({
    summary: "Lister les apprenants d'une école",
    description:
      "Récupère la liste paginée des apprenants enregistrés dans l'école courante avec options de filtrage.",
  })
  @ApiParam({ name: 'ecoleId', description: "ID unique (UUID) de l'école" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Liste d'apprenants retournée avec métadonnées de pagination.",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Droits insuffisants pour accéder à cette ressource.',
  })
  findAll(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Query() query: QueryApprenantDto,
  ) {
    return this.apprenantService.findAll(query, ecoleId);
  }

  @Get(':id')
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.apprenant),
  )
  @ApiOperation({
    summary: "Détails d'un apprenant",
    description:
      "Récupère le profil d'un apprenant, ses parents, son compte utilisateur et son historique d'inscription dans l'école.",
  })
  @ApiParam({ name: 'ecoleId', description: "ID unique (UUID) de l'école" })
  @ApiParam({ name: 'id', description: "ID unique (UUID) de l'apprenant" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Détails de l'apprenant trouvés.",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Droits insuffisants.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Apprenant introuvable dans cette école.',
  })
  findOne(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.apprenantService.findOne(id, ecoleId);
  }

  @Patch(':id')
  @CheckPolicies((ability) =>
    ability.can(permission_action.UPDATE, permission_cible.apprenant),
  )
  @ApiOperation({
    summary: 'Mettre à jour un apprenant',
    description:
      "Modifie les informations personnelles d'un apprenant (nom, prénom, sexe, date de naissance, matricule).",
  })
  @ApiParam({ name: 'ecoleId', description: "ID unique (UUID) de l'école" })
  @ApiParam({
    name: 'id',
    description: "ID unique (UUID) de l'apprenant à modifier",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Informations de l'apprenant mises à jour avec succès.",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données de mise à jour invalides.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Droits insuffisants.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Apprenant introuvable.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Le nouveau matricule ou email fourni est déjà utilisé.',
  })
  update(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApprenantDto,
  ) {
    return this.apprenantService.update(id, dto, ecoleId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.DELETE, permission_cible.apprenant),
  )
  @ApiOperation({
    summary: 'Supprimer un apprenant',
    description: 'Supprime un apprenant et ses relations associées.',
  })
  @ApiParam({ name: 'ecoleId', description: "ID unique (UUID) de l'école" })
  @ApiParam({
    name: 'id',
    description: "ID unique (UUID) de l'apprenant à supprimer",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Apprenant supprimé avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Droits insuffisants.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Apprenant introuvable dans cette école.',
  })
  remove(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.apprenantService.remove(id, ecoleId);
  }
}
