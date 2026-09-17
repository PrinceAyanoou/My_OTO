import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';

import { DossierScolariteService } from './dossier-scolarite.service';
import {
  CreateDossierScolariteDto,
  UpdateDossierScolariteDto,
} from './dto/dossier-scolarite.dto';

import { ClerkAuthGuard } from 'src/auth/guards/clerk-auth.guard';
import { PoliciesGuard } from 'src/auth/guards/permissions.guard';
import { CheckPolicies } from 'src/auth/decorators/check-permissions.decorator';
import {
  permission_action,
  permission_cible,
} from 'src/generated/prisma/client';

@ApiTags('Dossiers Scolarité')
@ApiBearerAuth('clerk-auth')
@UseGuards(ClerkAuthGuard, PoliciesGuard)
@UsePipes(ZodValidationPipe)
@Controller('dossiers-scolarite')
export class DossierScolariteController {
  constructor(
    private readonly dossierScolariteService: DossierScolariteService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPolicies((ability) =>
    ability.can(permission_action.CREATE, permission_cible.dossierScolarite),
  )
  @ApiOperation({ summary: 'Créer un dossier de scolarité pour un apprenant' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Dossier créé avec succès.',
  })
  async create(@Body() dto: CreateDossierScolariteDto) {
    return this.dossierScolariteService.create(dto);
  }

  @Get('annee/:anneeScolaireId')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.dossierScolarite),
  )
  @ApiOperation({ summary: 'Récupérer les dossiers par année scolaire' })
  @ApiParam({ name: 'anneeScolaireId', type: String })
  async findByAnnee(
    @Param('anneeScolaireId', ParseUUIDPipe) anneeScolaireId: string,
  ) {
    return this.dossierScolariteService.findByAnnee(anneeScolaireId);
  }

  @Get(':apprenantId/:anneeScolaireId')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.dossierScolarite),
  )
  @ApiOperation({ summary: 'Consulter le dossier de scolarité d’un apprenant' })
  @ApiParam({ name: 'apprenantId', type: String })
  @ApiParam({ name: 'anneeScolaireId', type: String })
  async findOne(
    @Param('apprenantId', ParseUUIDPipe) apprenantId: string,
    @Param('anneeScolaireId', ParseUUIDPipe) anneeScolaireId: string,
  ) {
    return this.dossierScolariteService.findOne(apprenantId, anneeScolaireId);
  }

  @Patch(':apprenantId/:anneeScolaireId')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.UPDATE, permission_cible.dossierScolarite),
  )
  @ApiOperation({ summary: 'Mettre à jour un dossier de scolarité' })
  @ApiParam({ name: 'apprenantId', type: String })
  @ApiParam({ name: 'anneeScolaireId', type: String })
  async update(
    @Param('apprenantId', ParseUUIDPipe) apprenantId: string,
    @Param('anneeScolaireId', ParseUUIDPipe) anneeScolaireId: string,
    @Body() dto: UpdateDossierScolariteDto,
  ) {
    return this.dossierScolariteService.update(
      apprenantId,
      anneeScolaireId,
      dto,
    );
  }
}
