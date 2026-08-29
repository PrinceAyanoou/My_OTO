import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { createClerkClient, Invitation } from '@clerk/backend';

import { PrismaService } from '../prisma/prisma.service';

import {
  CreateApprenantDto,
  UpdateApprenantDto,
  QueryApprenantDto,
} from './dto/apprenant.dto';

import { Prisma, user_statut } from 'src/generated/prisma/client';

@Injectable()
export class ApprenantService {
  private readonly clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  constructor(private readonly prisma: PrismaService) {}

  //créer un apprenant avec son compte user si l'email est fourni
  async create(dto: CreateApprenantDto, ecoleId: string) {
    //vérifier l'existe de l'école.
    const ecole = await this.prisma.ecole.findUnique({
      where: {
        id: ecoleId,
      },
    });

    if (!ecole) {
      throw new NotFoundException(`L'école '${ecoleId}' n'existe pas.`);
    }

    //vérifier l'existence de l'année scolaire.
    const anneeScolaire = await this.prisma.anneescolaire.findFirst({
      where: {
        id: dto.anneeScolaireId,
        ecoleId,
      },
    });

    if (!anneeScolaire) {
      throw new NotFoundException(
        `L'année scolaire '${dto.anneeScolaireId}' n'existe pas dans cette école.`,
      );
    }

    //vérifier l'existence de la classe scolaire.
    const classe = await this.prisma.classscolaire.findUnique({
      where: {
        id: dto.classeScolaireId,
      },
      include: {
        niveauscolaire: true,
      },
    });

    if (!classe) {
      throw new NotFoundException(
        `La classe '${dto.classeScolaireId}' n'existe pas.`,
      );
    }

    if (classe.niveauscolaire.ecoleId !== ecoleId) {
      throw new BadRequestException(
        `Cette classe n'appartient pas à cette école.`,
      );
    }

    //vérifier l'existence de la configuration scolaire.
    const configuration = await this.prisma.configurationscolarite.findFirst({
      where: {
        id: dto.configuartionScolariteId,
        ecoleId,
        anneeScolaireId: dto.anneeScolaireId,
        niveauScolaireId: classe.niveauScolaireId,
      },
    });

    if (!configuration) {
      throw new BadRequestException(
        `La configuration scolaire ne correspond pas à l'école, à l'année ou au niveau de la classe.`,
      );
    }

    //vérifier le matricule.
    const existingMatricule = await this.prisma.apprenant.findUnique({
      where: {
        matricule: dto.matricule,
      },
    });

    if (existingMatricule) {
      throw new ConflictException(
        `Le matricule '${dto.matricule}' est déjà utilisé.`,
      );
    }

    //vérifier si l'email a été renseigné et s'il n'existe pas déjà à cette école.
    if (dto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
        include: {
          ecole: true,
          apprenant: true,
          employe: true,
          parent: true,
        },
      });

      if (existingUser) {
        const appartientEcole = existingUser.ecole.some(
          (ecoleUser) => ecoleUser.id === ecoleId,
        );

        if (appartientEcole) {
          throw new ConflictException(
            `L'utilisateur avec l'email '${dto.email}' appartient déjà à cette école.`,
          );
        }
      }
    }
    let invitation: Invitation | null = null;

    //invitations clerk.
    if (dto.email) {
      try {
        invitation = await this.clerkClient.invitations.createInvitation({
          emailAddress: dto.email,
          redirectUrl: 'http://localhost:3001/sign-up',
          publicMetadata: {
            nom: dto.nom,
            prenoms: dto.prenoms,
          },
        });
      } catch (error) {
        throw new InternalServerErrorException(
          `Impossible d'envoyer l'invitation Clerk: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    //on essaye de créer l'apprenant en bd et on l'inscrit par la même occasion.
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const createdUser =
          dto.email && invitation
            ? await tx.user.create({
                data: {
                  clerkUserId: invitation.id,
                  nom: dto.nom,
                  prenoms: dto.prenoms,
                  email: dto.email,
                  telephone: dto.telephone,
                  statut: user_statut.DOIT_MODIFIER_MDP,
                },
              })
            : null;
        const apprenant = await tx.apprenant.create({
          data: {
            userId: createdUser?.id,
            matricule: dto.matricule,
            nom: dto.nom,
            prenoms: dto.prenoms,
            Sexe: dto.Sexe,
            dateNaissance: new Date(dto.dateNaissance),
          },
        });

        const inscription = await tx.inscription.create({
          data: {
            apprenantId: apprenant.id,

            matricule: dto.matricule,

            anneeScolaireId: dto.anneeScolaireId,

            classeScolaireId: dto.classeScolaireId,

            configuartionScolariteId: dto.configuartionScolariteId,

            type: dto.type,
          },
        });

        return {
          createdUser,
          apprenant,
          inscription,
        };
      });

      return {
        message: dto.email
          ? 'Apprenant créé et invitation envoyée.'
          : 'Apprenant créé et inscrit.',

        apprenant: result.apprenant,
        inscription: result.inscription,
        user: result.createdUser,

        invitationEnvoyee: Boolean(invitation),

        invitationId: invitation?.id ?? null,
      };
    } catch (error) {
      if (invitation?.id) {
        try {
          await this.clerkClient.invitations.revokeInvitation(invitation.id);
        } catch (revokeError) {
          console.error('Erreur lors de la révocation Clerk:', revokeError);
        }
      }
      throw error;
    }
  }

  //Lister les apprenant pour une école.
  async findAll(query: QueryApprenantDto, ecoleId: string) {
    const {
      page,
      limit,
      search,
      matricule,
      sexe,
      anneeScolaireId,
      classeScolaireId,
      userId,
    } = query;

    const skip = (page - 1) * limit;

    const conditions: Prisma.apprenantWhereInput[] = [];

    if (search) {
      conditions.push({
        OR: [
          {
            matricule: {
              contains: search,
            },
          },
          {
            nom: {
              contains: search,
            },
          },
          {
            prenoms: {
              contains: search,
            },
          },
          {
            user: {
              email: {
                contains: search,
              },
            },
          },
        ],
      });
    }

    if (matricule) {
      conditions.push({
        matricule: {
          contains: matricule,
        },
      });
    }

    if (sexe) {
      conditions.push({
        Sexe: sexe,
      });
    }

    if (userId) {
      conditions.push({
        userId,
      });
    }

    if (anneeScolaireId || classeScolaireId) {
      conditions.push({
        inscription: {
          some: {
            ...(anneeScolaireId ? { anneeScolaireId } : {}),

            ...(classeScolaireId ? { classeScolaireId } : {}),

            anneescolaire: {
              ecoleId,
            },
          },
        },
      });
    } else {
      conditions.push({
        inscription: {
          some: {
            anneescolaire: {
              ecoleId: ecoleId,
            },
          },
        },
      });
    }

    const where: Prisma.apprenantWhereInput = conditions.length
      ? {
          AND: conditions,
        }
      : {};

    const [total, data] = await Promise.all([
      this.prisma.apprenant.count({
        where,
      }),

      this.prisma.apprenant.findMany({
        where,

        skip,
        take: limit,

        include: {
          user: true,

          apprenantparent: {
            include: {
              parent: {
                include: {
                  user: true,
                },
              },
            },
          },

          inscription: {
            where: {
              anneescolaire: {
                ecoleId,
              },
            },

            include: {
              anneescolaire: true,
              classscolaire: true,
              configurationscolarite: true,
            },

            orderBy: {
              dateInscription: 'desc',
            },
          },
        },

        orderBy: {
          createdAt: 'desc',
        },
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

  //Trouver un apprenant dans une école.
  async findOne(apprenantId: string, ecoleId: string) {
    const apprenant = await this.prisma.apprenant.findFirst({
      where: {
        id: apprenantId,
        inscription: {
          some: {
            anneescolaire: {
              ecoleId: ecoleId,
            },
          },
        },
      },
      include: {
        user: true,
        apprenantparent: {
          include: {
            parent: {
              include: {
                user: true,
              },
            },
          },
        },
        inscription: {
          where: {
            anneescolaire: {
              ecoleId,
            },
          },
          include: {
            anneescolaire: true,
            classscolaire: true,
            configurationscolarite: true,

            absence: true,
            bulletin: true,
            decisionfinannee: true,
            dossierscolarite: {
              include: {
                paiement: true,
              },
            },
          },
          orderBy: {
            dateInscription: 'desc',
          },
        },
      },
    });

    if (!apprenant) {
      throw new NotFoundException(
        `L'apprenant '${apprenantId}' est introuvable dans cette école.`,
      );
    }
    return apprenant;
  }

  //Mettre à jour les informations d'un apprenant.
  async update(apprenantId: string, dto: UpdateApprenantDto, ecoleId: string) {
    await this.findOne(apprenantId, ecoleId);

    //vérifier le matricule.
    if (dto.matricule) {
      const existing = await this.prisma.apprenant.findFirst({
        where: {
          matricule: dto.matricule,

          NOT: {
            id: apprenantId,
          },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Le matricule '${dto.matricule}' est déjà utilisé.`,
        );
      }
    }
    //vérifier l'email.
    if (dto.email) {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (
        user &&
        user.id !==
          (
            await this.prisma.apprenant.findUnique({
              where: {
                id: apprenantId,
              },
              select: {
                userId: true,
              },
            })
          )?.userId
      ) {
        throw new ConflictException(`L'email '${dto.email}' est déjà utilisé.`);
      }
    }

    return this.prisma.apprenant.update({
      where: {
        id: apprenantId,
      },

      data: {
        ...(dto.nom !== undefined ? { nom: dto.nom } : {}),

        ...(dto.prenoms !== undefined ? { prenoms: dto.prenoms } : {}),

        ...(dto.Sexe !== undefined
          ? {
              Sexe: dto.Sexe,
            }
          : {}),

        ...(dto.dateNaissance !== undefined
          ? {
              dateNaissance: new Date(dto.dateNaissance),
            }
          : {}),

        ...(dto.matricule !== undefined
          ? {
              matricule: dto.matricule,
            }
          : {}),
      },
      include: {
        user: true,
        apprenantparent: {
          include: {
            parent: true,
          },
        },
      },
    });
  }

  //supprimer un apprenant d'une école.
  async remove(apprenantId: string, ecoleId: string) {
    const apprenant = await this.findOne(apprenantId, ecoleId);

    return this.prisma.apprenant.delete({
      where: {
        id: apprenant.id,
      },
    });
  }
}
