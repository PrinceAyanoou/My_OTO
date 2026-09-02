import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ApprenantParentService } from './apprenant-parent.service';
import { LinkApprenantDto } from './dto/apprenant-parent.dto';

@ApiTags('ApprenantParent')
@Controller('ecoles/:ecoleId/parents/:parentId/apprenants')
export class ApprenantParentController {
  constructor(
    private readonly apprenantParentService: ApprenantParentService,
  ) {}

  //Associer un apprenant à un parent
  @Post()
  @ApiOperation({
    summary: 'Associer un apprenant à un parent',
    description:
      'Crée une liaison entre un apprenant inscrit dans l’école spécifiée et un parent en définissant leur lien de parenté (PÈRE, MÈRE, TUTEUR).',
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
    status: HttpStatus.CREATED,
    description: 'La liaison apprenant-parent a été créée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données transmises invalides.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Le parent ou l’apprenant est introuvable dans cette école.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cet apprenant est déjà associé à ce parent.',
  })
  async create(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('parentId', ParseUUIDPipe) parentId: string,
    @Body() linkApprenantDto: LinkApprenantDto,
  ) {
    return this.apprenantParentService.linkApprenant(
      parentId,
      linkApprenantDto,
      ecoleId,
    );
  }

  //Supprimer la liaison entre un parent et un apprenant'
  @Delete(':apprenantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer la liaison entre un parent et un apprenant',
    description:
      'Retire l’association d’un élève de cette école avec un parent spécifique.',
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
  @ApiParam({
    name: 'apprenantId',
    description: 'ID de l’apprenant à délier (UUID)',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'La liaison a été supprimée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description:
      'L’apprenant est introuvable dans cette école ou la liaison n’existe pas.',
  })
  async remove(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('parentId', ParseUUIDPipe) parentId: string,
    @Param('apprenantId', ParseUUIDPipe) apprenantId: string,
  ) {
    return this.apprenantParentService.unlinkApprenant(
      parentId,
      apprenantId,
      ecoleId,
    );
  }
}
