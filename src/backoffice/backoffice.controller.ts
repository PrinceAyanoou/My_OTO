import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BackofficeService } from './backoffice.service';
import {
  TraiterDemandeDto,
  UpdateEcoleStatutDto,
  UpdateUserStatutDto,
  QueryDemandeDto,
  QueryGlobalDto,
} from './dto/backoffice.dto';

@ApiTags('Backoffice Admin')
@Controller('backoffice')
export class BackofficeController {
  constructor(private readonly backofficeService: BackofficeService) {}

  //Récupération de toutes les demandes des écoles (avec pagination et filtres)
  @Get('demandes')
  @ApiOperation({ summary: 'Lister toutes les demandes des écoles' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'statut',
    required: false,
    enum: ['EN_ATTENTE', 'APPROUVEE', 'REJETEE'],
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['CREATION', 'MODIFICATION', 'SUPPRESSION'],
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des demandes récupérée avec succès.',
  })
  async findAllDemandes(@Query() query: QueryDemandeDto) {
    return this.backofficeService.findAllDemandes(query);
  }

  //Traitement d'une demande par un admin (Approbation/Création/Modification ou Rejet)
  @Patch('demandes/:id/traiter')
  @ApiOperation({
    summary: 'Approuver ou rejeter une demande d’école',
    description:
      'En cas d’approbation d’une création, insère la nouvelle école en BDD avec son créateur. En cas de modification ou suppression, met à jour l’école existante.',
  })
  @ApiParam({ name: 'id', description: 'ID de la demande' })
  @ApiResponse({ status: 200, description: 'Demande traitée avec succès.' })
  @ApiResponse({
    status: 400,
    description: 'Demande déjà traitée ou données manquantes.',
  })
  @ApiResponse({ status: 404, description: 'Demande introuvable.' })
  async traiterDemande(
    @Param('id') id: string,
    @Body() dto: TraiterDemandeDto,
  ) {
    return this.backofficeService.traiterDemande(id, dto);
  }

  //Récupération globale de toutes les écoles
  @Get('ecoles')
  @ApiOperation({ summary: 'Lister toutes les écoles de la plateforme' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Recherche par nom, code, email, ville',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste globale des écoles récupérée.',
  })
  async findAllEcoles(@Query() query: QueryGlobalDto) {
    return this.backofficeService.findAllEcoles(query);
  }

  //Modification du statut d'une école (ex: Suspension/Activation)
  @Patch('ecoles/:id/statut')
  @ApiOperation({ summary: "Changer directement le statut d'une école" })
  @ApiParam({ name: 'id', description: "ID de l'école" })
  @ApiResponse({ status: 200, description: "Statut de l'école mis à jour." })
  @ApiResponse({ status: 404, description: 'École introuvable.' })
  async updateEcoleStatut(
    @Param('id') id: string,
    @Body() dto: UpdateEcoleStatutDto,
  ) {
    return this.backofficeService.updateEcoleStatut(id, dto);
  }

  //Récupération globale de tous les utilisateurs
  @Get('users')
  @ApiOperation({ summary: 'Lister tous les utilisateurs de la plateforme' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Recherche par nom, prénom, email',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs récupérée.',
  })
  async findAllUsers(@Query() query: QueryGlobalDto) {
    return this.backofficeService.findAllUsers(query);
  }

  //Modification du statut d'un utilisateur
  @Patch('users/:id/statut')
  @ApiOperation({ summary: "Changer le statut d'un utilisateur" })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur" })
  @ApiResponse({
    status: 200,
    description: "Statut de l'utilisateur mis à jour.",
  })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable.' })
  async updateUserStatut(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatutDto,
  ) {
    return this.backofficeService.updateUserStatut(id, dto);
  }
}
