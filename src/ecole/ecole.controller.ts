import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { EcoleService } from './ecole.service';
import type { AffecterMembreDto } from './dto/AffecterMembre.dto';

@ApiTags('Ecoles')
@Controller('ecoles')
export class EcoleController {
  constructor(private readonly ecoleService: EcoleService) {}

  //lister les écoles avec filtres
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Récupérer la liste des écoles',
    description:
      'Retourne une liste paginée des écoles avec possibilité de filtrage par ville ou recherche textuelle.',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Nombre d’éléments à ignorer (pagination)',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Nombre d’éléments à récupérer (pagination)',
  })
  @ApiQuery({
    name: 'ville',
    required: false,
    type: String,
    description: 'Filtrer par ville',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Recherche par nom, code, email ou nom du fondateur',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des écoles récupérée avec succès.',
  })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('ville') ville?: string,
    @Query('search') search?: string,
  ) {
    return this.ecoleService.findAll({ skip, take, ville, search });
  }

  //Rechercher une école par son code unique
  @Get('code/:code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Récupérer une école par son code unique',
    description:
      'Permet de trouver une école grâce à son code unique généré (ex: CSSJ-8F2A1C).',
  })
  @ApiParam({
    name: 'code',
    type: String,
    description: 'Code unique de l’école',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'École trouvée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Aucune école correspondante au code fourni.',
  })
  async findByCode(@Param('code') code: string) {
    return this.ecoleService.findByCode(code);
  }

  //Rechercher une école par son ID
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Récupérer les détails d’une école par son ID',
    description:
      'Retourne les informations d’une école, son créateur, ses niveaux scolaires et son année scolaire en cours.',
  })
  @ApiParam({ name: 'id', type: String, description: 'ID UUID de l’école' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'École trouvée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'École introuvable.',
  })
  async findOne(@Param('id') id: string) {
    return this.ecoleService.findOne(id);
  }

  //ajouter/affecter un utilisateur à une école.
  @Post(':id/membres')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Affecter un utilisateur à une école sous un profil (Employé, Parent, Apprenant)',
    description:
      'Lie un utilisateur existant à l’école et crée/met à jour son profil spécifique selon le rôle demandé.',
  })
  @ApiParam({ name: 'id', type: String, description: 'ID UUID de l’école' })
  @ApiBody({
    description:
      'Payload contenant le rôle (EMPLOYE, PARENT, APPRENANT) et les champs requis selon le profil.',
    schema: {
      type: 'object',
      properties: {
        role: { type: 'string', enum: ['EMPLOYE', 'PARENT', 'APPRENANT'] },
        userId: { type: 'string', format: 'uuid' },
        matricule: {
          type: 'string',
          description: 'Requis pour EMPLOYE et APPRENANT',
        },
        profession: { type: 'string', description: 'Requis pour PARENT' },
        nom: { type: 'string', description: 'Requis pour APPRENANT' },
        prenoms: { type: 'string', description: 'Requis pour APPRENANT' },
        sexe: {
          type: 'string',
          enum: ['MASCULIN', 'FEMININ'],
          description: 'Requis pour APPRENANT',
        },
        dateNaissance: {
          type: 'string',
          format: 'date-time',
          description: 'Requis pour APPRENANT',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Membre affecté à l’école avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Champs obligatoires manquants ou invalides.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'École ou utilisateur introuvable.',
  })
  async addMember(
    @Param('id') ecoleId: string,
    @Body() dto: AffecterMembreDto,
  ) {
    return this.ecoleService.addMember(ecoleId, dto);
  }

  //Retirer un membre d'une école.
  @Delete(':ecoleId/membres/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retirer un utilisateur d’une école',
    description:
      'Déconnecte la relation entre l’utilisateur et l’école sans supprimer le compte de l’utilisateur.',
  })
  @ApiParam({ name: 'id', type: String, description: 'ID UUID de l’école' })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'ID UUID de l’utilisateur à retirer',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Membre retiré de l’école avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'École ou utilisateur introuvable.',
  })
  async removeMember(
    @Param('ecoleId') ecoleId: string,
    @Param('userId') userId: string,
  ) {
    return this.ecoleService.removeMember(ecoleId, userId);
  }
}
