import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { RolesService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@ApiTags('Roles')
@Controller('ecoles/:ecoleId/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un rôle personnalisé pour une école' })
  @ApiParam({
    name: 'ecoleId',
    description: "Identifiant unique de l'école",
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Le rôle a été créé avec succès.',
  })
  @ApiBadRequestResponse({
    description:
      "Une ou plusieurs permissions spécifiées sont invalides ou n'existent pas en BDD.",
  })
  @ApiConflictResponse({
    description: 'Le rôle existe déjà dans cette école.',
  })
  createCustomRole(
    @Param('ecoleId') ecoleId: string,
    @Body() createRoleDto: CreateRoleDto,
  ) {
    return this.rolesService.createCustomRole(createRoleDto, ecoleId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Récupérer tous les rôles d'une école avec leurs permissions",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "Identifiant unique de l'école",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des rôles récupérée avec succès.',
  })
  readRoleForMySchool(@Param('ecoleId') ecoleId: string) {
    return this.rolesService.readRoleForMySchool(ecoleId);
  }

  @Patch(':roleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mettre à jour un rôle d'une école" })
  @ApiParam({
    name: 'ecoleId',
    description: "Identifiant unique de l'école",
  })
  @ApiParam({
    name: 'roleId',
    description: 'Identifiant unique du rôle à modifier',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Le rôle a été mis à jour avec succès.',
  })
  @ApiBadRequestResponse({
    description:
      'Les rôles système ne peuvent pas être modifiés OU permissions invalides.',
  })
  @ApiNotFoundResponse({
    description: "Le rôle n'existe pas dans cette école.",
  })
  @ApiConflictResponse({
    description: 'Un autre rôle porte déjà ce nom dans cette école.',
  })
  updateRole(
    @Param('ecoleId') ecoleId: string,
    @Param('roleId') roleId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.updateRole(roleId, ecoleId, updateRoleDto);
  }

  @Delete(':roleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Supprimer un rôle personnalisé d'une école" })
  @ApiParam({
    name: 'ecoleId',
    description: "Identifiant unique de l'école",
  })
  @ApiParam({
    name: 'roleId',
    description: 'Identifiant unique du rôle à supprimer',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Le rôle a été supprimé avec succès.',
  })
  @ApiBadRequestResponse({
    description: 'Les rôles système ne peuvent pas être supprimés.',
  })
  @ApiNotFoundResponse({
    description: "Ce rôle n'existe pas ou n'appartient pas à cette école.",
  })
  deleteRole(
    @Param('ecoleId') ecoleId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.rolesService.deleteRole(roleId, ecoleId);
  }
}
