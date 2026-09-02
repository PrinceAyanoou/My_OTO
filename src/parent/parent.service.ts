import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { createClerkClient, Invitation } from '@clerk/backend';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateParentWithUserDto,
  UpdateParentDto,
  QueryParentDto,
} from './dto/parent.dto';
import { Prisma, user_statut } from 'src/generated/prisma/client';
@Injectable()
export class ParentService {
  private clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  constructor(private readonly prisma: PrismaService) {}

  // Création d'un Parent + Invitation Clerk + Transaction Prisma
  async createParentWithUser(dto: CreateParentWithUserDto) {
    // Vérification préalable de l'utilisateur
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException(
        `Un utilisateur avec l'email ${dto.email} existe déjà.`,
      );
    }

    let clerkInvitation: Invitation;
    try {
      // Envoi de l'invitation par mail via Clerk
      clerkInvitation = await this.clerkClient.invitations.createInvitation({
        emailAddress: dto.email,
        redirectUrl: 'http://localhost:3001/sign-up',
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
      // Transaction Prisma : enregistrer le User, le Parent et les liaisons Apprenants
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            clerkUserId: clerkInvitation.id,
            nom: dto.nom,
            prenoms: dto.prenoms,
            email: dto.email,
            telephone: dto.telephone,
            statut: user_statut.DOIT_MODIFIER_MDP,
          },
        });

        const parent = await tx.parent.create({
          data: {
            userId: user.id,
            profession: dto.profession,
            apprenantparent: dto.apprenants?.length
              ? {
                  create: dto.apprenants.map((item) => ({
                    apprenantId: item.apprenantId,
                    lien: item.lien,
                  })),
                }
              : undefined,
          },
          include: {
            user: true,
            apprenantparent: {
              include: {
                apprenant: true,
              },
            },
          },
        });

        return { user, parent };
      });

      return {
        message: 'Invitation envoyée par e-mail avec succès au parent.',
        parent: result.parent,
      };
    } catch (error) {
      // Annuler l'invitation Clerk si la création BDD échoue
      if (clerkInvitation?.id) {
        await this.clerkClient.invitations.revokeInvitation(clerkInvitation.id);
      }
      throw error;
    }
  }

  // Recherche paginée des parents avec filtre textuel et option d'école
  async findAll(query: QueryParentDto & { ecoleId?: string }) {
    const { page = 1, limit = 10, search, ecoleId } = query;
    const skip = (page - 1) * limit;

    const whereConditions: Prisma.parentWhereInput[] = [];

    // Recherche par mots-clés
    if (search) {
      whereConditions.push({
        OR: [
          { profession: { contains: search } },
          { user: { nom: { contains: search } } },
          { user: { prenoms: { contains: search } } },
          { user: { email: { contains: search } } },
          { user: { telephone: { contains: search } } },
        ],
      });
    }

    // Filtre optionnel par école (via la relation des enfants inscrits)
    if (ecoleId) {
      whereConditions.push({
        apprenantparent: {
          some: {
            apprenant: {
              inscription: {
                some: {
                  anneescolaire: {
                    ecoleId,
                  },
                },
              },
            },
          },
        },
      });
    }

    const where: Prisma.parentWhereInput =
      whereConditions.length > 0 ? { AND: whereConditions } : {};

    const [total, data] = await Promise.all([
      this.prisma.parent.count({ where }),
      this.prisma.parent.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: true,
          apprenantparent: {
            include: {
              apprenant: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Récupération d'un parent par son ID dans une école spécifique avec ses enfants inscrits dans cette école
  async findOne(parentId: string, ecoleId: string) {
    const parent = await this.prisma.parent.findFirst({
      where: {
        id: parentId,
        apprenantparent: {
          some: {
            apprenant: {
              inscription: {
                some: {
                  anneescolaire: {
                    ecoleId: ecoleId,
                  },
                },
              },
            },
          },
        },
      },
      include: {
        user: true,
        apprenantparent: {
          where: {
            apprenant: {
              inscription: {
                some: {
                  anneescolaire: {
                    ecoleId: ecoleId,
                  },
                },
              },
            },
          },
          include: {
            apprenant: {
              include: {
                inscription: {
                  where: {
                    anneescolaire: {
                      ecoleId: ecoleId,
                    },
                  },
                  include: {
                    classscolaire: true,
                    anneescolaire: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!parent) {
      throw new NotFoundException(
        `Parent introuvable ou non associé à l'école spécifiée.`,
      );
    }

    return parent;
  }

  //Récupération d'un parent par son Id avec ses enfants et leurs inscriptions. On trie ça par école
  async findChildrenOfParentBySchool(parentId: string, ecoleId: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { id: parentId },
      select: {
        id: true,
        profession: true,
        user: {
          select: {
            clerkUserId: true,
            nom: true,
            prenoms: true,
            email: true,
          },
        },
        apprenantparent: {
          where: {
            apprenant: {
              inscription: {
                some: {
                  anneescolaire: {
                    ecoleId: ecoleId,
                  },
                },
              },
            },
          },
          select: {
            apprenantId: true,
            lien: true,
            apprenant: {
              select: {
                nom: true,
                prenoms: true,
                dateNaissance: true,
                matricule: true,
                inscription: {
                  where: {
                    anneescolaire: {
                      ecoleId: ecoleId,
                    },
                  },
                  select: {
                    classscolaire: {
                      select: {
                        id: true,
                        nom: true,
                      },
                    },
                    anneescolaire: {
                      select: {
                        id: true,
                        nom: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!parent) {
      throw new NotFoundException('Parent introuvable');
    }
    return parent;
  }

  // Mise à jour des informations du parent
  async update(parentId: string, dto: UpdateParentDto, ecoleId: string) {
    await this.findChildrenOfParentBySchool(parentId, ecoleId);

    return this.prisma.parent.update({
      where: { id: parentId },
      data: {
        profession: dto.profession,
      },
      include: {
        user: true,
        apprenantparent: {
          include: {
            apprenant: true,
          },
        },
      },
    });
  }

  // Suppression d'un parent dans une école.
  async remove(parentId: string, ecoleId: string) {
    const parent = await this.findChildrenOfParentBySchool(parentId, ecoleId);

    if (!parent) {
      throw new NotFoundException(
        'vous essayez de supprimer un parent inexistant dans votre école.',
      );
    }

    return this.prisma.parent.delete({
      where: { id: parent.id },
    });
  }
}
