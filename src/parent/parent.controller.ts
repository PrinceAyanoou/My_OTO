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
import { ParentService } from './parent.service';
import {
  CreateParentWithUserDto,
  UpdateParentDto,
  QueryParentDto,
} from './dto/parent.dto';

@ApiTags('Parents')
@Controller('ecoles/:ecoleId/parents')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Post()
  @ApiOperation({
    summary:
      "Créer un parent avec son compte utilisateur et l'inviter via Clerk",
    description:
      "Crée un profil utilisateur, le rôle parent, envoie une invitation par e-mail via Clerk et permet d'associer directement des enfants (apprenants).",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID de l'école concernée (UUID)",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Le parent a été créé et le courriel d’invitation envoyé.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Un utilisateur avec cet e-mail existe déjà.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données transmises invalides.',
  })
  async create(
    @Param('ecoleId', ParseUUIDPipe) _ecoleId: string,
    @Body() createParentWithUserDto: CreateParentWithUserDto,
  ) {
    return this.parentService.createParentWithUser(createParentWithUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les parents avec recherche textuelle et pagination',
    description:
      'Permet de filtrer la recherche par nom, prénom, email ou profession, ainsi que par école.',
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID de l'école (UUID)",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste paginée des parents retournée avec succès.',
  })
  async findAll(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Query() query: QueryParentDto,
  ) {
    return this.parentService.findAll({ ...query, ecoleId });
  }

  @Get(':parentId')
  @ApiOperation({
    summary: 'Récupérer un parent avec ses enfants inscrits dans cette école',
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID de l'école (UUID)",
    type: String,
  })
  @ApiParam({
    name: 'parentId',
    description: 'ID du parent (UUID)',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails du parent et de ses enfants récupérés avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Parent non trouvé ou sans enfants inscrits dans cette école.',
  })
  async findOne(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('parentId', ParseUUIDPipe) parentId: string,
  ) {
    return this.parentService.findOne(parentId, ecoleId);
  }

  @Get(':parentId/enfants')
  @ApiOperation({
    summary: 'Récupérer les enfants d’un parent triés par école',
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID de l'école (UUID)",
    type: String,
  })
  @ApiParam({
    name: 'parentId',
    description: 'ID du parent (UUID)',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des enfants du parent pour cette école.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Parent introuvable.',
  })
  async findChildrenOfParentBySchool(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('parentId', ParseUUIDPipe) parentId: string,
  ) {
    return this.parentService.findChildrenOfParentBySchool(parentId, ecoleId);
  }

  @Patch(':parentId')
  @ApiOperation({ summary: 'Mettre à jour la profession d’un parent' })
  @ApiParam({
    name: 'ecoleId',
    description: "ID de l'école (UUID)",
    type: String,
  })
  @ApiParam({
    name: 'parentId',
    description: 'ID du parent à modifier (UUID)',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Informations du parent mises à jour avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Parent introuvable dans cette école.',
  })
  async update(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('parentId', ParseUUIDPipe) parentId: string,
    @Body() updateParentDto: UpdateParentDto,
  ) {
    return this.parentService.update(parentId, updateParentDto, ecoleId);
  }

  @Delete(':parentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un parent de l’école' })
  @ApiParam({
    name: 'ecoleId',
    description: "ID de l'école (UUID)",
    type: String,
  })
  @ApiParam({
    name: 'parentId',
    description: 'ID du parent à supprimer (UUID)',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Parent supprimé avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Parent introuvable dans cette école.',
  })
  async remove(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('parentId', ParseUUIDPipe) parentId: string,
  ) {
    return this.parentService.remove(parentId, ecoleId);
  }
}
