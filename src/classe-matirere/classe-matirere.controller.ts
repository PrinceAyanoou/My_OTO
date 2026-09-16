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
import { ClasseMatiereService } from './classe-matirere.service';
import {
  CreateClasseMatiereDto,
  UpdateClasseMatiereDto,
  ClasseMatiereQueryDto,
} from './dto/classe-matirere.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';
import { CheckPolicies } from '../auth/decorators/check-permissions.decorator';
import { AppAbility } from '../auth/casl/casl-ability.factory/casl-ability.factory';
import {
  permission_action,
  permission_cible,
} from 'src/generated/prisma/client';

@ApiTags('Classes - Matières')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, PoliciesGuard)
@UsePipes(ZodValidationPipe)
@Controller('ecoles/:ecoleId/classes-matieres')
export class ClasseMatiereController {
  constructor(private readonly classeMatiereService: ClasseMatiereService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(permission_action.CREATE, permission_cible.classeMatiere),
  )
  @ApiOperation({
    summary: 'Associer une matière à une classe',
    description:
      'Crée une nouvelle association entre une classe et une matière pour une école donnée.',
  })
  @ApiParam({ name: 'ecoleId', description: "ID unique (UUID) de l'école" })
  @ApiResponse({ status: 201, description: 'Association créée avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès interdit.' })
  @ApiResponse({
    status: 409,
    description: 'Matière déjà associée à cette classe.',
  })
  create(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Body() dto: CreateClasseMatiereDto,
  ) {
    return this.classeMatiereService.create(ecoleId, dto);
  }

  @Get()
  @CheckPolicies((ability: AppAbility) =>
    ability.can(permission_action.READ, permission_cible.classeMatiere),
  )
  @ApiOperation({
    summary: 'Lister les associations classe-matière',
    description: 'Récupère la liste paginée des associations classe-matière.',
  })
  @ApiParam({ name: 'ecoleId', description: "ID unique (UUID) de l'école" })
  @ApiResponse({ status: 200, description: 'Liste récupérée avec succès.' })
  findAll(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Query() query: ClasseMatiereQueryDto,
  ) {
    return this.classeMatiereService.findAll(ecoleId, query);
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) =>
    ability.can(permission_action.READ, permission_cible.classeMatiere),
  )
  @ApiOperation({ summary: 'Obtenir une association classe-matière par ID' })
  @ApiParam({ name: 'ecoleId', description: "ID unique (UUID) de l'école" })
  @ApiParam({ name: 'id', description: "ID unique (UUID) de l'association" })
  @ApiResponse({ status: 200, description: 'Détails récupérés avec succès.' })
  @ApiResponse({ status: 404, description: 'Association introuvable.' })
  findOne(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.classeMatiereService.findOne(ecoleId, id);
  }

  @Patch(':id')
  @CheckPolicies((ability: AppAbility) =>
    ability.can(permission_action.UPDATE, permission_cible.classeMatiere),
  )
  @ApiOperation({ summary: 'Mettre à jour une association classe-matière' })
  @ApiParam({ name: 'ecoleId', description: "ID unique (UUID) de l'école" })
  @ApiParam({ name: 'id', description: "ID unique (UUID) de l'association" })
  @ApiResponse({ status: 200, description: 'Association mise à jour.' })
  update(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClasseMatiereDto,
  ) {
    return this.classeMatiereService.update(ecoleId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(permission_action.DELETE, permission_cible.classeMatiere),
  )
  @ApiOperation({ summary: 'Supprimer une association classe-matière' })
  @ApiParam({ name: 'ecoleId', description: "ID unique (UUID) de l'école" })
  @ApiParam({ name: 'id', description: "ID unique (UUID) de l'association" })
  @ApiResponse({ status: 200, description: 'Association supprimée.' })
  remove(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.classeMatiereService.remove(ecoleId, id);
  }
}
