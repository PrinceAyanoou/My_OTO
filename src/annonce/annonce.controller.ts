import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  ParseBoolPipe,
  HttpCode,
  HttpStatus,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { AnnonceService } from './annonce.service';
import { CreateAnnonceDto, UpdateAnnonceDto } from './dto/annonce.dto';
import { ClerkAuthGuard } from 'src/auth/guards/clerk-auth.guard';
import { PoliciesGuard } from 'src/auth/guards/permissions.guard';
import { CheckPolicies } from 'src/auth/decorators/check-permissions.decorator';
import {
  permission_action,
  permission_cible,
} from 'src/generated/prisma/client';

@ApiTags('Annonces')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, PoliciesGuard)
@UsePipes(ZodValidationPipe)
@Controller('ecoles/:ecoleId/annonces')
export class AnnonceController {
  constructor(private readonly annonceService: AnnonceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies((ability) =>
    ability.can(permission_action.CREATE, permission_cible.annonce),
  )
  @ApiOperation({
    summary: 'Créer une nouvelle annonce avec ses cibles',
    description:
      'Création atomique d’une annonce et de son audience (cibles). Si la date d’expiration est absente, elle est fixée à +30 jours.',
  })
  @ApiParam({ name: 'ecoleId', description: "ID unique (UUID) de l'école" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Annonce et cibles créées avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Format des données invalide ou dates incohérentes.',
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
    description: 'Employé auteur non trouvé.',
  })
  create(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Body() createAnnonceDto: CreateAnnonceDto,
  ) {
    return this.annonceService.create(createAnnonceDto, ecoleId);
  }

  @Get()
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.annonce),
  )
  @ApiOperation({
    summary: 'Récupérer les annonces d’une école',
    description: 'Liste l’ensemble des annonces d’une école avec leurs cibles.',
  })
  @ApiParam({ name: 'ecoleId', description: "ID unique (UUID) de l'école" })
  @ApiQuery({
    name: 'onlyActive',
    required: false,
    type: Boolean,
    description: 'Filtrer uniquement les annonces non expirées.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des annonces récupérée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Droits insuffisants pour accéder à cette ressource.',
  })
  findAllBySchool(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Query('onlyActive', new ParseBoolPipe({ optional: true }))
    onlyActive?: boolean,
  ) {
    return this.annonceService.findAllBySchool(ecoleId, onlyActive ?? false);
  }

  @Get(':id')
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.annonce),
  )
  @ApiOperation({ summary: 'Obtenir le détail d’une annonce' })
  @ApiParam({ name: 'ecoleId', description: "ID unique (UUID) de l'école" })
  @ApiParam({ name: 'id', description: "ID unique (UUID) de l'annonce" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détail de l’annonce récupéré avec succès.',
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
    description: 'Annonce non trouvée.',
  })
  findOne(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.annonceService.findOne(id, ecoleId);
  }

  @Patch(':id')
  @CheckPolicies((ability) =>
    ability.can(permission_action.UPDATE, permission_cible.annonce),
  )
  @ApiOperation({
    summary: 'Mettre à jour une annonce',
    description:
      'Modifie l’annonce. Si de nouvelles cibles sont transmises, elles remplacent entièrement les anciennes cibles.',
  })
  @ApiParam({ name: 'ecoleId', description: "ID unique (UUID) de l'école" })
  @ApiParam({ name: 'id', description: "ID unique (UUID) de l'annonce" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Annonce mise à jour avec succès.',
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
    description: 'Annonce non trouvée.',
  })
  update(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAnnonceDto: UpdateAnnonceDto,
  ) {
    return this.annonceService.update(id, updateAnnonceDto, ecoleId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.DELETE, permission_cible.annonce),
  )
  @ApiOperation({ summary: 'Supprimer une annonce' })
  @ApiParam({ name: 'ecoleId', description: "ID unique (UUID) de l'école" })
  @ApiParam({ name: 'id', description: "ID unique (UUID) de l'annonce" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Annonce supprimée avec succès.',
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
    description: 'Annonce non trouvée.',
  })
  remove(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.annonceService.remove(id, ecoleId);
  }
}
