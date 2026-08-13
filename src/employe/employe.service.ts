import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { createClerkClient, Invitation } from '@clerk/backend';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateEmployeWithUserDto,
  UpdateEmployeDto,
  AddEmployeDocumentDto,
  QueryEmployeDto,
} from './dto/employe.dto';
import { Prisma, user_statut } from 'src/generated/prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class EmployeService {
  private clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // Création d'un employé + Invitation Clerk
  async createEmployeWithUser(dto: CreateEmployeWithUserDto) {
    // 1. Vérifications préalables (User & Matricule)
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException(
        `Un utilisateur avec l'email ${dto.email} existe déjà.`,
      );
    }

    const existingMatricule = await this.prisma.employe.findUnique({
      where: { matricule: dto.matricule },
    });
    if (existingMatricule) {
      throw new ConflictException(
        `Le matricule '${dto.matricule}' est déjà utilisé.`,
      );
    }

    // 2. Validation des rôles (si fournis)
    const validRoleIds =
      dto.rolesIds?.filter((id) => id && id.trim() !== '') || [];

    let clerkInvitation: Invitation;
    try {
      // 3. Envoyer l'invitation par mail via Clerk
      clerkInvitation = await this.clerkClient.invitations.createInvitation({
        emailAddress: dto.email,
        redirectUrl: 'http://localhost:3001/sign-up', // L'URL de votre frontend (page de finalisation d'inscription)
        publicMetadata: {
          nom: dto.nom,
          prenoms: dto.prenoms,
        },
      });
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Erreur lors de l'envoi de l'invitation Clerk: ${error}`,
      );
    }

    try {
      // 4. Transaction Prisma : enregistrer le User et l'Employé
      // Remarque : On peut utiliser clerkInvitation.id temporairement comme ID ou créer le User
      // lorsque le Webhook Clerk 'user.created' confirme que l'utilisateur a accepté l'invitation.
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            clerkUserId: clerkInvitation.id, // Ou l'ID généré par votre logique interne
            nom: dto.nom,
            prenoms: dto.prenoms,
            email: dto.email,
            telephone: dto.telephone,
            statut: user_statut.DOIT_MODIFIER_MDP, // Statut en attente de l'acceptation de l'invitation
          },
        });

        const employe = await tx.employe.create({
          data: {
            clerkUserId: clerkInvitation.id,
            matricule: dto.matricule,
            dateEmbauche: new Date(dto.dateEmbauche),
            ecoleId: dto.ecoleId,
            employerole: validRoleIds.length
              ? {
                  create: validRoleIds.map((roleId) => ({ roleId })),
                }
              : undefined,
          },
          include: {
            user: true,
            employerole: {
              include: { role: true },
            },
          },
        });

        return { user, employe };
      });

      return {
        message: 'Invitation envoyée par e-mail avec succès.',
        employe: result.employe,
      };
    } catch (error) {
      // Annuler l'invitation Clerk si la création BDD échoue
      if (clerkInvitation?.id) {
        await this.clerkClient.invitations.revokeInvitation(clerkInvitation.id);
      }
      throw error;
    }
  }

  async findAll(query: QueryEmployeDto) {
    const { page, limit, search, roleId, ecoleId } = query;
    const skip = (page - 1) * limit;

    //Construction d'un tableau de conditions fortement typé
    const whereConditions: Prisma.employeWhereInput[] = [];

    if (search) {
      whereConditions.push({
        OR: [
          { matricule: { contains: search } },
          { user: { nom: { contains: search } } },
          { user: { prenoms: { contains: search } } },
          { user: { email: { contains: search } } },
        ],
      });
    }

    if (roleId) {
      whereConditions.push({
        employerole: {
          some: { roleId },
        },
      });
    }

    if (ecoleId) {
      whereConditions.push({
        ecoleId,
      });
    }

    //filtre final de type Prisma.employeWhereInput
    const where: Prisma.employeWhereInput =
      whereConditions.length > 0 ? { AND: whereConditions } : {};

    const [total, data] = await Promise.all([
      this.prisma.employe.count({ where }),
      this.prisma.employe.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: true,
          employerole: {
            include: { role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const result = {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    if (!result.data) {
      throw new NotFoundException(
        'Impossible de trouver des résultats avec les informations fournies',
      );
    }

    if (!result) {
      throw new InternalServerErrorException('Erreur de connexion à la db');
    }

    return result;
  }

  //   //
  //   //Récupérer la liste des employés par école
  //   async findBySchool(ecoleId: string) {
  //     const ExistingEcoleId = await this.prisma.ecole.findUnique({
  //       where: { id: ecoleId },
  //     });

  //     if (!ExistingEcoleId) {
  //       throw new NotFoundException(
  //         `L'école avec l'ID '${ecoleId}' n'existe pas!`,
  //       );
  //     }
  //     return await this.prisma.employe.findMany({
  //       where: { ecoleId: ecoleId },
  //     });
  //   }

  //Récupération d'un employé par son ID dans une école.
  async findOne(id: string, ecoleId: string) {
    const employe = await this.prisma.employe.findFirst({
      where: {
        id: id,
        ecoleId: ecoleId,
      },
      include: {
        user: true,
        employerole: {
          include: { role: true },
        },
        employedocument: true,
        affectationenseignant: {
          include: {
            classscolaire: true,
            matiere: true,
            anneescolaire: true,
          },
        },
      },
    });

    if (!employe) {
      throw new NotFoundException(
        ecoleId
          ? `Employé avec l'ID '${id}' introuvable pour cette école.`
          : `Employé avec l'ID '${id}' introuvable.`,
      );
    }

    return employe;
  }

  //
  //Mise à jour des informations de l'employé
  async update(employeId: string, dto: UpdateEmployeDto, ecoleId: string) {
    await this.findOne(employeId, ecoleId);

    if (dto.matricule) {
      const existingMatricule = await this.prisma.employe.findUnique({
        where: { matricule: dto.matricule },
      });

      if (existingMatricule) {
        throw new ConflictException(
          `Le matricule '${dto.matricule}' est déjà utilisé.`,
        );
      }
    }

    return this.prisma.employe.update({
      where: { id: employeId },
      data: {
        matricule: dto.matricule,
        dateEmbauche: dto.dateEmbauche,
      },
      include: {
        user: true,
        employerole: {
          include: { role: true },
        },
      },
    });
  }

  //
  //Suppression d'un employé (ne supprime pas le user associé.)
  async remove(employeId: string, ecoleId: string) {
    const employe = await this.findOne(employeId, ecoleId);

    return this.prisma.employe.delete({
      where: { id: employe.id },
    });
  }

  //
  // Ajout d'un document employe
  async addDocument(
    employeId: string,
    dto: Omit<AddEmployeDocumentDto, 'documentUrl'>,
    file: Express.Multer.File,
    ecoleId: string,
  ) {
    await this.findOne(employeId, ecoleId);

    if (!file) {
      throw new BadRequestException('Aucun fichier fourni.');
    }

    // Upload vers Cloudinary
    const result = await this.cloudinaryService.uploadFile(
      file,
      'employes_docs',
    );

    // Sauvegarde de l'URL Cloudinary  en db
    return this.prisma.employedocument.create({
      data: {
        employeId,
        type: dto.type,
        titre: dto.titre,
        documentUrl: result.secure_url, // URL hébergée sur Cloudinary
      },
    });
  }

  //
  //Suppression d'un document administratif
  async removeDocument(documentId: string, ecoleId: string) {
    // Récupérer le document
    const document = await this.prisma.employedocument.findUnique({
      where: {
        id: documentId,
        employe: {
          ecoleId: ecoleId,
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document introuvable');
    }
    // Extraire le Public ID et supprimer sur Cloudinary
    if (document.documentUrl) {
      try {
        const publicId = this.cloudinaryService.extractPublicIdFromUrl(
          document.documentUrl,
        );
        await this.cloudinaryService.deleteFile(publicId);
      } catch (error) {
        // log de l'erreur si le fichier a déjà été supprimé côté Cloudinary
        console.error(
          'Erreur lors de la suppression du fichier Cloudinary:',
          error,
        );
      }
    }

    // Supprimer de la BDD Prisma
    return this.prisma.employedocument.delete({
      where: { id: documentId },
    });
  }
}
