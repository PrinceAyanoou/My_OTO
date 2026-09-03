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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AnnonceService } from './annonce.service';
import { CreateAnnonceDto, UpdateAnnonceDto } from './dto/annonce.dto';

@ApiTags('Annonces')
@Controller('ecoles/:ecoleId/annonces')
export class AnnonceController {
  constructor(private readonly annonceService: AnnonceService) {}

  //Créer une nouvelle annonce avec ses cibles
  @Post()
  @ApiOperation({
    summary: 'Créer une nouvelle annonce avec ses cibles',
    description:
      'Création atomique d’une annonce et de son audience (cibles). Si la date d’expiration est absente, elle est fixée à +30 jours.',
  })
  @ApiParam({ name: 'ecoleId', description: "UUID de l'école" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Annonce et cibles créées avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Format des données invalide ou dates incohérentes.',
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

  //Récupérer les annonces d’une école
  @Get()
  @ApiOperation({
    summary: 'Récupérer les annonces d’une école',
    description: 'Liste l’ensemble des annonces d’une école avec leurs cibles.',
  })
  @ApiParam({ name: 'ecoleId', description: "UUID de l'école" })
  @ApiQuery({
    name: 'onlyActive',
    required: false,
    type: Boolean,
    description: 'Filtrer uniquement les annonces non expirées.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Liste des annonces.' })
  findAllBySchool(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Query('onlyActive', new ParseBoolPipe({ optional: true }))
    onlyActive?: boolean,
  ) {
    return this.annonceService.findAllBySchool(ecoleId, onlyActive ?? false);
  }

  //Obtenir le détail d’une annonce
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir le détail d’une annonce' })
  @ApiParam({ name: 'ecoleId', description: "UUID de l'école" })
  @ApiParam({ name: 'id', description: "UUID de l'annonce" })
  @ApiResponse({ status: HttpStatus.OK, description: 'Détail de l’annonce.' })
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

  //Mettre à jour une annonce
  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour une annonce',
    description:
      'Modifie l’annonce. Si de nouvelles cibles sont transmises, elles remplacent entièrement les anciennes cibles.',
  })
  @ApiParam({ name: 'ecoleId', description: "UUID de l'école" })
  @ApiParam({ name: 'id', description: "UUID de l'annonce" })
  @ApiResponse({ status: HttpStatus.OK, description: 'Annonce mise à jour.' })
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

  //Supprimer une annonce
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une annonce' })
  @ApiParam({ name: 'ecoleId', description: "UUID de l'école" })
  @ApiParam({ name: 'id', description: "UUID de l'annonce" })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Annonce supprimée.',
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
