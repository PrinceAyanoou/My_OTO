import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { PaiementService } from './paiement.service';

import { CreatePaiementDto, UpdatePaiementDto } from './dto/paiement.dto';

@ApiTags('Paiements')
@Controller('ecoles/:ecoleId/paiements')
export class PaiementController {
  constructor(private readonly paiementService: PaiementService) {}

  // CRÉER UN PAIEMENT
  @Post()
  @ApiOperation({
    summary: 'Créer un paiement',
    description:
      'Crée un paiement pour un dossier scolaire appartenant à une école.',
  })
  @ApiParam({
    name: 'ecoleId',
    description: 'Identifiant de l’école',
    example: 'ecole-123',
  })
  @ApiBody({
    type: CreatePaiementDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Le paiement a été créé avec succès.',
  })
  @ApiResponse({
    status: 400,
    description: 'Le montant du paiement dépasse le reste à payer.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Le dossier scolaire est introuvable ou n’appartient pas à cette école.',
  })
  create(@Param('ecoleId') ecoleId: string, @Body() dto: CreatePaiementDto) {
    return this.paiementService.create(ecoleId, dto);
  }

  // RÉCUPÉRER TOUS LES PAIEMENTS
  @Get()
  @ApiOperation({
    summary: 'Récupérer tous les paiements',
    description:
      'Retourne tous les paiements appartenant aux dossiers scolaires de cette école.',
  })
  @ApiParam({
    name: 'ecoleId',
    description: 'Identifiant de l’école',
    example: 'ecole-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des paiements récupérée avec succès.',
  })
  findAll(@Param('ecoleId') ecoleId: string) {
    return this.paiementService.findAll(ecoleId);
  }

  // RÉCUPÉRER UN PAIEMENT
  @Get(':paiementId')
  @ApiOperation({
    summary: 'Récupérer un paiement',
    description:
      'Retourne les détails d’un paiement appartenant à cette école.',
  })
  @ApiParam({
    name: 'ecoleId',
    description: 'Identifiant de l’école',
    example: 'ecole-123',
  })
  @ApiParam({
    name: 'paiementId',
    description: 'Identifiant du paiement',
    example: 'paiement-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Paiement récupéré avec succès.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Le paiement est introuvable ou n’appartient pas à cette école.',
  })
  findOne(
    @Param('ecoleId') ecoleId: string,
    @Param('paiementId') paiementId: string,
  ) {
    return this.paiementService.findOne(ecoleId, paiementId);
  }

  // MODIFIER UN PAIEMENT
  @Patch(':paiementId')
  @ApiOperation({
    summary: 'Modifier un paiement',
    description:
      'Modifie les informations d’un paiement. Si son montant change, le reste à payer du dossier scolaire est recalculé.',
  })
  @ApiParam({
    name: 'ecoleId',
    description: 'Identifiant de l’école',
    example: 'ecole-123',
  })
  @ApiParam({
    name: 'paiementId',
    description: 'Identifiant du paiement',
    example: 'paiement-123',
  })
  @ApiBody({
    type: UpdatePaiementDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Le paiement a été modifié avec succès.',
  })
  @ApiResponse({
    status: 400,
    description: 'La modification du montant dépasse le reste à payer.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Le paiement est introuvable ou n’appartient pas à cette école.',
  })
  update(
    @Param('ecoleId') ecoleId: string,
    @Param('paiementId') paiementId: string,
    @Body() dto: UpdatePaiementDto,
  ) {
    return this.paiementService.update(ecoleId, paiementId, dto);
  }

  // SUPPRIMER UN PAIEMENT
  @Delete(':paiementId')
  @ApiOperation({
    summary: 'Supprimer un paiement',
    description:
      'Supprime un paiement et réajuste le reste à payer du dossier scolaire concerné.',
  })
  @ApiParam({
    name: 'ecoleId',
    description: 'Identifiant de l’école',
    example: 'ecole-123',
  })
  @ApiParam({
    name: 'paiementId',
    description: 'Identifiant du paiement',
    example: 'paiement-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Le paiement a été supprimé avec succès.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Le paiement est introuvable ou n’appartient pas à cette école.',
  })
  remove(
    @Param('ecoleId') ecoleId: string,
    @Param('paiementId') paiementId: string,
  ) {
    return this.paiementService.remove(ecoleId, paiementId);
  }
}
