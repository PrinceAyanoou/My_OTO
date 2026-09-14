import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  StreamableFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
// Import du type sous forme de 'import type' ou via le namespace express
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { NoteService } from './note.service';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';
import { ImportNotesExcelDto } from './dto/note-excel.dto';

@ApiTags('Notes')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Jeton JWT invalide ou manquant.' })
@ApiForbiddenResponse({ description: 'Accès refusé pour cette école.' })
@ApiInternalServerErrorResponse({ description: 'Erreur interne du serveur.' })
@Controller('ecole/:ecoleId/notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer ou mettre à jour une note individuelle',
    description:
      'Recherche une note existante pour un élève et une évaluation. Si elle existe, la met à jour, sinon elle est créée.',
  })
  @ApiParam({
    name: 'ecoleId',
    type: String,
    description: "ID de l'école dans l'URL",
  })
  @ApiCreatedResponse({
    description: 'La note a été créée ou mise à jour avec succès.',
  })
  @ApiBadRequestResponse({
    description:
      'La valeur de la note est négative ou dépasse le barème noteSur.',
  })
  @ApiNotFoundResponse({
    description: 'Évaluation ou inscription introuvable pour cette école.',
  })
  async createOrUpdate(
    @Param('ecoleId') ecoleId: string,
    @Body() dto: CreateNoteDto,
  ) {
    return this.noteService.createOrUpdate(dto, ecoleId);
  }

  @Get('export-excel')
  @ApiOperation({
    summary: 'Générer et télécharger la fiche de saisie Excel des notes',
    description:
      'Exporte un fichier Excel pré-rempli avec les élèves de la classe et des tokens masqués pour la saisie hors-ligne.',
  })
  @ApiParam({ name: 'ecoleId', type: String, description: "ID de l'école" })
  @ApiQuery({
    name: 'classeScolaireId',
    required: true,
    type: String,
    description: 'ID de la classe scolaire',
  })
  @ApiQuery({
    name: 'evaluationId',
    required: true,
    type: String,
    description: "ID de l'évaluation",
  })
  @ApiOkResponse({
    description: 'Fichier Excel généré et renvoyé sous forme de flux binaire.',
  })
  @ApiNotFoundResponse({
    description: 'Aucun élève inscrit dans cette classe.',
  })
  async exportExcel(
    @Param('ecoleId') ecoleId: string,
    @Query('classeScolaireId') classeScolaireId: string,
    @Query('evaluationId') evaluationId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const buffer = await this.noteService.generateClassSheet(
      classeScolaireId,
      evaluationId,
      ecoleId,
    );

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="Fiche_de_Notes.xlsx"',
    });

    return new StreamableFile(buffer);
  }

  @Post('import-excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Importer des notes à partir d un fichier Excel',
    description:
      'Parse le fichier Excel téléversé, décode les références masquées des élèves et enregistre les notes valides.',
  })
  @ApiParam({ name: 'ecoleId', type: String, description: "ID de l'école" })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Fichier Excel (.xlsx, .xls)',
        },
        evaluationId: { type: 'string', description: "ID de l'évaluation" },
        noteSur: {
          type: 'number',
          default: 20,
          description: 'Barème de notation',
        },
      },
      required: ['file', 'evaluationId', 'noteSur'],
    },
  })
  @ApiCreatedResponse({
    description:
      'Importation terminée avec rapport explicite du nombre de succès et erreurs.',
  })
  @ApiBadRequestResponse({
    description: 'Le fichier transmis est absent, corrompu ou vide.',
  })
  @ApiNotFoundResponse({
    description: 'Évaluation introuvable pour cette école.',
  })
  async importExcel(
    @Param('ecoleId') ecoleId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImportNotesExcelDto,
  ) {
    if (!file) {
      throw new BadRequestException('Le fichier Excel est obligatoire.');
    }
    return this.noteService.importFromExcel(file, dto, ecoleId);
  }

  @Get('evaluation/:evaluationId')
  @ApiOperation({ summary: "Récupérer toutes les notes d'une évaluation" })
  @ApiParam({ name: 'ecoleId', type: String, description: "ID de l'école" })
  @ApiParam({
    name: 'evaluationId',
    type: String,
    description: "ID de l'évaluation",
  })
  @ApiOkResponse({
    description: 'Liste de toutes les notes rattachées à cette évaluation.',
  })
  @ApiNotFoundResponse({
    description: 'Évaluation introuvable ou droits insuffisants.',
  })
  async findByEvaluation(
    @Param('ecoleId') ecoleId: string,
    @Param('evaluationId') evaluationId: string,
  ) {
    return this.noteService.findByEvaluation(evaluationId, ecoleId);
  }

  @Get('apprenant/:apprenantId')
  @ApiOperation({
    summary: "Récupérer toutes les notes d'un élève pour une année scolaire",
  })
  @ApiParam({ name: 'ecoleId', type: String, description: "ID de l'école" })
  @ApiParam({
    name: 'apprenantId',
    type: String,
    description: "ID de l'apprenant",
  })
  @ApiQuery({
    name: 'anneeScolaireId',
    required: true,
    type: String,
    description: "ID de l'année scolaire",
  })
  @ApiOkResponse({
    description:
      "Liste des notes de l'élève pour l'année scolaire sélectionnée.",
  })
  async findByApprenant(
    @Param('ecoleId') ecoleId: string,
    @Param('apprenantId') apprenantId: string,
    @Query('anneeScolaireId') anneeScolaireId: string,
  ) {
    return this.noteService.findByApprenant(
      apprenantId,
      anneeScolaireId,
      ecoleId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une note par son identifiant' })
  @ApiParam({ name: 'ecoleId', type: String, description: "ID de l'école" })
  @ApiParam({ name: 'id', type: String, description: 'ID de la note' })
  @ApiOkResponse({ description: 'Note trouvée.' })
  @ApiNotFoundResponse({ description: 'Note introuvable avec cet ID.' })
  async findOne(@Param('ecoleId') ecoleId: string, @Param('id') id: string) {
    return this.noteService.findOne(id, ecoleId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une note existante' })
  @ApiParam({ name: 'ecoleId', type: String, description: "ID de l'école" })
  @ApiParam({ name: 'id', type: String, description: 'ID de la note' })
  @ApiOkResponse({ description: 'Note mise à jour avec succès.' })
  @ApiBadRequestResponse({
    description: 'La valeur saisie dépasse le barème autorisé.',
  })
  @ApiNotFoundResponse({ description: 'Note introuvable.' })
  async update(
    @Param('ecoleId') ecoleId: string,
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.noteService.update(id, dto, ecoleId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une note' })
  @ApiParam({ name: 'ecoleId', type: String, description: "ID de l'école" })
  @ApiParam({ name: 'id', type: String, description: 'ID de la note' })
  @ApiOkResponse({ description: 'Note supprimée avec succès.' })
  @ApiNotFoundResponse({ description: 'Note introuvable.' })
  async remove(@Param('ecoleId') ecoleId: string, @Param('id') id: string) {
    return this.noteService.remove(id, ecoleId);
  }
}
