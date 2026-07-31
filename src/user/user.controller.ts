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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un utilisateur (Clerk + BDD)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "L'utilisateur a été créé avec succès.",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données fournies invalides (validation DTO).',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Un utilisateur avec cet email existe déjà.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description:
      "Échec de la création du compte sur le service d'authentification (Clerk) ou problème BDD.",
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lister les utilisateurs avec filtres et recherche',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des utilisateurs récupérée avec succès.',
  })
  findAll(@Query() filters: FilterUserDto) {
    return this.usersService.findAll(filters);
  }

  @Get('clerk/:clerkUserId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtenir un profil utilisateur via son Clerk ID' })
  @ApiParam({
    name: 'clerkUserId',
    description: "Identifiant unique de l'utilisateur émis par Clerk",
    example: 'user_2N3k5l6m7...',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profil utilisateur trouvé.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Profil utilisateur non trouvé.',
  })
  findByClerkId(@Param('clerkUserId') clerkUserId: string) {
    return this.usersService.findByClerkId(clerkUserId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtenir un utilisateur par son ID en BDD' })
  @ApiParam({
    name: 'id',
    description: "Identifiant UUID / CUID de l'utilisateur en base locale",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Utilisateur trouvé.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Utilisateur introuvable.',
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mettre à jour un utilisateur (BDD + Synchro Clerk)',
  })
  @ApiParam({
    name: 'id',
    description: "Identifiant BDD de l'utilisateur à modifier",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Utilisateur mis à jour avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données de mise à jour invalides.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Utilisateur introuvable.',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un utilisateur (BDD + Clerk)' })
  @ApiParam({
    name: 'id',
    description: "Identifiant BDD de l'utilisateur à supprimer",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Utilisateur supprimé avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Utilisateur introuvable.',
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
