import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { EmployeService } from './employe.service';

import {
  QueryEmployeSchema,
  type AddEmployeDocumentDto,
  type CreateEmployeWithUserDto,
  type QueryEmployeDto,
  type UpdateEmployeDto,
} from './dto/employe.dto';

@ApiTags('Employés')
@Controller('employes')
export class EmployeController {
  constructor(private readonly employeService: EmployeService) {}

  //créer un employé clerk + db
  @Post(':ecoleId/create-employe')
  @ApiOperation({
    summary: 'Créer un employé',
    description:
      'Crée simultanément un compte Clerk, un utilisateur en base de données et un employé. Des rôles peuvent être attribués lors de la création.',
  })
  @ApiBody({
    description: 'Informations nécessaires à la création de l’employé',
    schema: {
      example: {
        nom: 'DOSSOU',
        prenoms: 'Prince Ayanou',
        email: 'prince@example.com',
        telephone: '97000000',
        matricule: 'EMP-2026-001',
        dateEmbauche: '2026-08-07',
        rolesIds: [''],
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Employé et compte utilisateur créés avec succès.',
  })
  @ApiResponse({
    status: 409,
    description: 'L’email ou le matricule existe déjà.',
  })
  @ApiResponse({
    status: 500,
    description: 'Erreur lors de la création du compte Clerk.',
  })
  async create(
    @Body() dto: CreateEmployeWithUserDto,
    @Param('ecoleId') ecoleId: string,
  ) {
    dto.ecoleId = ecoleId;
    return this.employeService.createEmployeWithUser(dto);
  }

  // LISTE DES EMPLOYES
  @Get()
  @ApiOperation({
    summary: 'Lister les employés',
    description:
      'Retourne la liste paginée des employés. Il est possible de rechercher par matricule, nom, prénom ou email et de filtrer par rôle.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Numéro de la page.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Nombre d’employés par page. Maximum : 100.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'DOSSOU',
    description: 'Recherche par matricule, nom, prénom ou adresse email.',
  })
  @ApiQuery({
    name: 'roleId',
    required: false,
    type: String,
    example: 'c8b7e4d1-1234-4567-8901-abcdef123456',
    description: 'Identifiant du rôle utilisé pour filtrer les employés.',
  })
  @ApiQuery({
    name: 'ecoleId',
    required: false,
    type: String,
    example: 'c8b7e4d1-1234-4567-8901-abcdef123456',
    description: "Identifiant de l'école pour filtrer les employés par école",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste paginée des employés.',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            matricule: 'EMP-2026-001',
            dateEmbauche: '2026-08-07T00:00:00.000Z',
            user: {
              id: 'uuid',
              nom: 'DOSSOU',
              prenoms: 'Prince Ayanou',
              email: 'prince@example.com',
            },
            employerole: [],
          },
        ],
        meta: {
          total: 25,
          page: 1,
          limit: 10,
          totalPages: 3,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Employé introuvable',
  })
  @ApiResponse({
    status: 500,
    description: 'Erreur de connexion à la db',
  })
  async findAll(@Query() query: QueryEmployeDto) {
    const dto = QueryEmployeSchema.parse(query);

    return this.employeService.findAll(dto);
  }

  //
  // Récupérer un employé par son id
  @Get(':ecoleId/:employeId')
  @ApiOperation({
    summary: 'Récupérer un employé',
    description:
      'Retourne les informations complètes d’un employé, notamment son utilisateur, ses rôles, ses documents et ses affectations.',
  })
  @ApiParam({
    name: 'employeId',
    description: 'Identifiant unique de l’employé.',
    example: 'c8b7e4d1-1234-4567-8901-abcdef123456',
  })
  @ApiParam({
    name: 'ecoleId',
    description: "identifiant de l'école ou on veut trouver l'employé",
  })
  @ApiResponse({
    status: 200,
    description: 'Employé trouvé.',
  })
  @ApiResponse({
    status: 404,
    description: 'Employé introuvable ou n’appartenant pas à l’école.',
  })
  async findOne(
    @Param('employeId') employeId: string,
    @Param('ecoleId') ecoleId: string,
  ) {
    return this.employeService.findOne(employeId, ecoleId);
  }

  //
  // Mise à jour des informations de l'employé
  @Patch(':ecoleId/:employeId')
  @ApiOperation({
    summary: 'Modifier les infos pour un employé',
    description:
      'Modifie les informations professionnelles d’un employé. Le matricule et la date d’embauche peuvent être modifiés.',
  })
  @ApiParam({
    name: 'employeId',
    description: 'Identifiant unique de l’employé.',
    example: 'c8b7e4d1-1234-4567-8901-abcdef123456',
  })
  @ApiParam({
    name: 'ecoleId',
    description: "Identifiant de l'école de l'employé",
    example: 'c8b7e4d1-1234-4567-8901-abcdef123456',
  })
  @ApiBody({
    description: 'Informations à modifier.',
    schema: {
      example: {
        matricule: 'EMP-2026-015',
        dateEmbauche: '2026-09-01',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Employé modifié avec succès.',
  })
  @ApiResponse({
    status: 404,
    description: 'Employé introuvable ou école introuvable.',
  })
  @ApiResponse({
    status: 409,
    description: 'Le nouveau matricule est déjà utilisé.',
  })
  async update(
    @Param('employeId') employeId: string,
    @Body() dto: UpdateEmployeDto,
    @Param('ecoleId') ecoleId: string,
  ) {
    return this.employeService.update(employeId, dto, ecoleId);
  }

  //
  //Supprimer un employé dans l'école sans supprimer le user.
  @Delete(':ecoleId/:employeId')
  @ApiOperation({
    summary: 'Supprimer un employé',
    description:
      'Supprime l’enregistrement de l’employé. Le compte User associé n’est pas supprimé.',
  })
  @ApiParam({
    name: 'employeId',
    description: 'Identifiant unique de l’employé.',
    example: 'c8b7e4d1-1234-4567-8901-abcdef123456',
  })
  @ApiParam({
    name: 'ecoleId',
    description: "Identifiant de l'école de l'employé",
    example: 'c8b7e4d1-1234-4567-8901-abcdef123456',
  })
  @ApiResponse({
    status: 200,
    description: 'Employé supprimé avec succès.',
  })
  @ApiResponse({
    status: 404,
    description: 'Employé introuvable.',
  })
  async remove(
    @Param('employeId') id: string,
    @Param('ecoleId') ecoleId: string,
  ) {
    return this.employeService.remove(id, ecoleId);
  }

  //
  //Ajout d'un document administratif à un employé dans une école.
  @Post(':ecoleId/:employeId/documents')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Ajouter un document administratif',
    description:
      "Ajoute un document administratif à un employé. Le fichier est envoyé à Cloudinary puis l'URL est enregistrée dans la base de données.",
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'employeId',
    description: 'Identifiant unique de l’employé.',
    example: 'c8b7e4d1-1234-4567-8901-abcdef123456',
  })
  @ApiParam({
    name: 'ecoleId',
    description: "Identifiant de l'école de l'employé",
    example: 'c8b7e4d1-1234-4567-8901-abcdef123456',
  })
  @ApiBody({
    description: 'Document administratif et fichier à envoyer.',
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['DIPLOME', 'CONTRAT', 'PIECE_IDENTITE', 'JUSTIFICATIF'],
          example: 'DIPLOME',
        },
        titre: {
          type: 'string',
          example: 'Diplôme de licence',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['type', 'titre', 'file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Document ajouté avec succès.',
  })
  @ApiResponse({
    status: 400,
    description: 'Aucun fichier fourni ou données invalides.',
  })
  @ApiResponse({
    status: 404,
    description: 'Employé introuvable.',
  })
  async addDocument(
    @Param('employeId') employeId: string,
    @Body() dto: Omit<AddEmployeDocumentDto, 'documentUrl'>,
    @UploadedFile() file: Express.Multer.File,
    @Param('ecoleId') ecoleId: string,
  ) {
    return this.employeService.addDocument(employeId, dto, file, ecoleId);
  }

  //
  //supprimer le document d'un employé dans une école.
  @Delete(':ecoleId/documents/:documentId')
  @ApiOperation({
    summary: 'Supprimer un document administratif',
    description:
      'Supprime le document de Cloudinary puis de la base de données Prisma.',
  })
  @ApiParam({
    name: 'documentId',
    description: 'Identifiant unique du document.',
    example: 'c8b7e4d1-1234-4567-8901-abcdef123456',
  })
  @ApiParam({
    name: 'ecoleId',
    description: "Identifiant de l'école de l'employé",
    example: 'c8b7e4d1-1234-4567-8901-abcdef123456',
  })
  @ApiResponse({
    status: 200,
    description: 'Document supprimé avec succès.',
  })
  @ApiResponse({
    status: 404,
    description: 'Document introuvable ou non associé à cette école.',
  })
  async removeDocument(
    @Param('documentId') documentId: string,
    @Param('ecoleId') ecoleId: string,
  ) {
    return this.employeService.removeDocument(documentId, ecoleId);
  }
}
