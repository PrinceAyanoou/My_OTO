import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { MatiereUeService } from './matiere-ue.service';
import {
  AddMatiereToUeDto,
  UpdateMatiereCoefficientDto,
} from './dto/matiereue.dto';

@ApiTags("Matières - Unités d'Enseignement")
@UsePipes(ZodValidationPipe)
@Controller('ecoles/:ecoleId/unites-enseignement/:ueId/matieres')
export class MatiereUeController {
  constructor(private readonly matiereUeService: MatiereUeService) {}

  //Ajouter une matière à une Unité d'Enseignement
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Ajouter une matière à une Unité d'Enseignement",
    description:
      "Associe une matière à l'UE spécifiée pour une école donnée et récalcule le coefficient total de l'UE.",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école",
    type: String,
  })
  @ApiParam({
    name: 'ueId',
    description: "ID unique (UUID) de l'Unité d'Enseignement",
    type: String,
  })
  @ApiBody({ type: AddMatiereToUeDto })
  @ApiResponse({
    status: 201,
    description: "La matière a été associée avec succès à l'UE.",
  })
  @ApiResponse({
    status: 400,
    description: "Données d'entrée invalides ou UUID malformé.",
  })
  @ApiResponse({
    status: 404,
    description:
      "L'Unité d'Enseignement ou la Matière est introuvable pour cette école.",
  })
  @ApiResponse({
    status: 409,
    description: 'La matière est déjà associée à cette UE.',
  })
  addMatiere(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('ueId', ParseUUIDPipe) ueId: string,
    @Body() dto: AddMatiereToUeDto,
  ) {
    return this.matiereUeService.addMatiere(ecoleId, ueId, dto);
  }

  //Lister toutes les matières d'une Unité d'Enseignement
  @Get()
  @ApiOperation({
    summary: "Lister toutes les matières d'une Unité d'Enseignement",
    description:
      'Récupère la liste des matières rattachées à une UE pour une école spécifique.',
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école",
    type: String,
  })
  @ApiParam({
    name: 'ueId',
    description: "ID unique (UUID) de l'Unité d'Enseignement",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des matières récupérée avec succès.',
  })
  @ApiResponse({
    status: 404,
    description: "Unité d'enseignement introuvable pour cette école.",
  })
  findMatieresByUe(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('ueId', ParseUUIDPipe) ueId: string,
  ) {
    return this.matiereUeService.findMatieresByUe(ecoleId, ueId);
  }

  //Modifier le coefficient d'une matière dans une UE
  @Patch(':matiereId')
  @ApiOperation({
    summary: "Modifier le coefficient d'une matière dans une UE",
    description:
      "Met à jour le coefficient de la matière au sein de l'UE et récalcule le total.",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école",
    type: String,
  })
  @ApiParam({
    name: 'ueId',
    description: "ID unique (UUID) de l'Unité d'Enseignement",
    type: String,
  })
  @ApiParam({
    name: 'matiereId',
    description: 'ID unique (UUID) de la Matière',
    type: String,
  })
  @ApiBody({ type: UpdateMatiereCoefficientDto })
  @ApiResponse({
    status: 200,
    description: 'Coefficient mis à jour avec succès.',
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides.',
  })
  @ApiResponse({
    status: 404,
    description: 'Association introuvable pour cette école.',
  })
  updateMatiereCoefficient(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('ueId', ParseUUIDPipe) ueId: string,
    @Param('matiereId', ParseUUIDPipe) matiereId: string,
    @Body() dto: UpdateMatiereCoefficientDto,
  ) {
    return this.matiereUeService.updateMatiereCoefficient(
      ecoleId,
      ueId,
      matiereId,
      dto,
    );
  }

  //Retirer une matière d'une Unité d'Enseignement
  @Delete(':matiereId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Retirer une matière d'une Unité d'Enseignement",
    description:
      "Supprime la relation entre la matière et l'UE puis récalcule le coefficient total de l'UE.",
  })
  @ApiParam({
    name: 'ecoleId',
    description: "ID unique (UUID) de l'école",
    type: String,
  })
  @ApiParam({
    name: 'ueId',
    description: "ID unique (UUID) de l'Unité d'Enseignement",
    type: String,
  })
  @ApiParam({
    name: 'matiereId',
    description: 'ID unique (UUID) de la Matière à retirer',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Matière retirée de l'UE avec succès.",
  })
  @ApiResponse({
    status: 404,
    description: 'Association introuvable pour cette école.',
  })
  removeMatiere(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('ueId', ParseUUIDPipe) ueId: string,
    @Param('matiereId', ParseUUIDPipe) matiereId: string,
  ) {
    return this.matiereUeService.removeMatiere(ecoleId, ueId, matiereId);
  }
}
