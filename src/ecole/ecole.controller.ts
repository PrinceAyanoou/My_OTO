import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiExtraModels,
  ApiBody,
  getSchemaPath,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { EcoleService } from './ecole.service';
import * as AffecterMembreDto from './dto/AffecterMembre.dto';

@ApiTags('Ecoles')
@Controller('ecoles')
export class EcoleController {
  constructor(private readonly ecoleService: EcoleService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer la liste des écoles' })
  @ApiResponse({
    status: 200,
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

  @Get('code/:code')
  @ApiOperation({ summary: 'Récupérer une école par son code unique' })
  @ApiResponse({ status: 200, description: 'École trouvée.' })
  @ApiResponse({ status: 404, description: 'École introuvable.' })
  async findByCode(@Param('code') code: string) {
    return this.ecoleService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une école par son ID' })
  @ApiResponse({ status: 200, description: 'École trouvée.' })
  @ApiResponse({ status: 404, description: 'École introuvable.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ecoleService.findOne(id);
  }

  @Post(':id/membres')
  @HttpCode(HttpStatus.OK)
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Affecter un membre (Employé, Parent ou Apprenant) à une école',
  })
  @ApiExtraModels(
    AffecterMembreDto.CreateEmployeDto,
    AffecterMembreDto.CreateParentDto,
    AffecterMembreDto.CreateApprenantDto,
  )
  @ApiBody({
    description: 'Payload dépendant du rôle du membre à ajouter',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(AffecterMembreDto.CreateEmployeDto) },
        { $ref: getSchemaPath(AffecterMembreDto.CreateParentDto) },
        { $ref: getSchemaPath(AffecterMembreDto.CreateApprenantDto) },
      ],
    },
  })
  @ApiResponse({ status: 200, description: 'Membre affecté avec succès.' })
  @ApiResponse({
    status: 404,
    description: 'École ou Utilisateur introuvable.',
  })
  async addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AffecterMembreDto.AffecterMembreDto,
  ) {
    return this.ecoleService.addMember(id, dto);
  }

  @Delete(':id/membres/:userId')
  @ApiOperation({ summary: 'Retirer un membre d’une école' })
  @ApiResponse({
    status: 200,
    description: 'Membre retiré de l’école avec succès.',
  })
  @ApiResponse({ status: 404, description: 'École introuvable.' })
  async removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.ecoleService.removeMember(id, userId);
  }
}
