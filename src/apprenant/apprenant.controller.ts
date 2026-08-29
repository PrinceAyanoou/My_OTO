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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ApprenantService } from './apprenant.service';
import {
  CreateApprenantDto,
  UpdateApprenantDto,
  QueryApprenantDto,
} from './dto/apprenant.dto';

@ApiTags('Apprenants')
@Controller('ecoles/:ecoleId/apprenants')
export class ApprenantController {
  constructor(private readonly apprenantService: ApprenantService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Créer un apprenant et l'inscrire",
    description:
      "Crée l'apprenant, son compte utilisateur (avec invitation Clerk si email présent) et effectue son inscription initiale.",
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "L'apprenant et son inscription ont été créés avec succès.",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "La classe ou la configuration ne correspond pas à l'école.",
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
    @Body() dto: CreateApprenantDto,
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
  ) {
    return this.apprenantService.create(dto, ecoleId);
  }

  @Get()
  @ApiOperation({
    summary: "Lister les apprenants d'une école",
    description:
      "Récupère la liste paginée des apprenants enregistrés dans l'école courante avec options de filtrage.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Liste d'apprenants retournée avec métadonnées de pagination.",
  })
  findAll(
    @Query() query: QueryApprenantDto,
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
  ) {
    return this.apprenantService.findAll(query, ecoleId);
  }

  @Get(':id')
  @ApiOperation({
    summary: "Détails d'un apprenant",
    description:
      "Récupère le profil d'un apprenant, ses parents, son compte utilisateur et son historique d'inscription dans l'école.",
  })
  @ApiParam({
    name: 'id',
    description: "L'UUID de l'apprenant",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Détails de l'apprenant trouvés.",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Apprenant introuvable dans cette école.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
  ) {
    return this.apprenantService.findOne(id, ecoleId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour un apprenant',
    description:
      "Modifie les informations personnelles d'un apprenant (nom, prénom, sexe, date de naissance, matricule).",
  })
  @ApiParam({
    name: 'id',
    description: "L'UUID de l'apprenant à modifier",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Informations de l'apprenant mises à jour avec succès.",
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
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApprenantDto,
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
  ) {
    return this.apprenantService.update(id, dto, ecoleId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer un apprenant',
    description: 'Supprime un apprenant et ses relations associées.',
  })
  @ApiParam({
    name: 'id',
    description: "L'UUID de l'apprenant à supprimer",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Apprenant supprimé avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Apprenant introuvable dans cette école.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
  ) {
    return this.apprenantService.remove(id, ecoleId);
  }
}
