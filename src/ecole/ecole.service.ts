import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Ajustez selon votre chemin
import { ecole, Prisma } from '../generated/prisma/client'; // Ajustez selon votre chemin
import { AffecterMembreDto } from './dto/AffecterMembre.dto';

@Injectable()
export class EcoleService {
  constructor(private readonly prisma: PrismaService) {}

  //Service pour récupérer la liste des écoles avec recherche, filtrage et pagination

  async findAll(params: {
    skip?: number;
    take?: number;
    ville?: string;
    search?: string;
  }) {
    const { skip, take, ville, search } = params;

    const where: Prisma.ecoleWhereInput = {
      ...(ville && { ville: { equals: ville } }),
      ...(search && {
        OR: [
          { nom: { contains: search } },
          { code: { contains: search } },
          { email: { contains: search } },
          { nomFondateur: { contains: search } },
        ],
      }),
    };

    const [total, ecoles] = await Promise.all([
      this.prisma.ecole.count({ where }),
      this.prisma.ecole.findMany({
        where,
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          createur: {
            select: {
              id: true,
              clerkUserId: true,
              nom: true,
              prenoms: true,
              email: true,
            },
          },
          _count: {
            select: { user: true, anneescolaire: true },
          },
        },
      }),
    ]);

    return { total, ecoles };
  }

  // service pour récupérer une école par son ID

  async findOne(id: string): Promise<ecole> {
    const ecole = await this.prisma.ecole.findUnique({
      where: { id },
      include: {
        createur: true,
        anneescolaire: { where: { statut: 'EN_COURS' } },
        niveauscolaire: true,
      },
    });

    if (!ecole) {
      throw new NotFoundException(`L'école avec l'ID "${id}" n'existe pas.`);
    }

    return ecole;
  }

  // service pour récupérer une école par son code unique
  async findByCode(code: string): Promise<ecole> {
    const ecole = await this.prisma.ecole.findUnique({
      where: { code },
      include: { createur: true },
    });

    if (!ecole) {
      throw new NotFoundException(
        `L'école avec le code "${code}" n'existe pas.`,
      );
    }

    return ecole;
  }

  // Associe un utilisateur/membre à l'école
  async addMember(ecoleId: string, dto: AffecterMembreDto) {
    // Vérification de l'existence de l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur introuvable`);
    }

    // Transaction pour lier à l'école + créer l'entité selon le rôle
    return this.prisma.$transaction(async (tx) => {
      // Lier l'utilisateur à l'école via la table de jonction
      await tx.ecole.update({
        where: { id: ecoleId },
        data: {
          user: {
            connect: { id: dto.userId },
          },
        },
      });

      // Gérer le profil spécifique
      switch (dto.role) {
        case 'EMPLOYE':
          await tx.employe.upsert({
            where: { clerkUserId: user.clerkUserId },
            create: {
              clerkUserId: user.clerkUserId,
              matricule: dto.matricule,
              dateEmbauche: dto.dateEmbauche,
            },
            update: {
              matricule: dto.matricule,
            },
          });
          break;

        case 'PARENT':
          await tx.parent.upsert({
            where: { userId: dto.userId },
            create: {
              userId: dto.userId,
              profession: dto.profession,
            },
            update: {
              profession: dto.profession,
            },
          });
          break;

        case 'APPRENANT':
          await tx.apprenant.upsert({
            where: { userId: dto.userId },
            create: {
              userId: dto.userId,
              matricule: dto.matricule,
              nom: dto.nom,
              prenoms: dto.prenoms,
              Sexe: dto.sexe,
              dateNaissance: dto.dateNaissance,
            },
            update: {
              matricule: dto.matricule,
              nom: dto.nom,
              prenoms: dto.prenoms,
              Sexe: dto.sexe,
              dateNaissance: dto.dateNaissance,
            },
          });
          break;
      }

      // Retourner l'utilisateur complet avec ses profils
      return tx.user.findUnique({
        where: { id: dto.userId },
        include: {
          employe: true,
          parent: true,
          apprenant: true,
          ecole: {
            where: { id: ecoleId },
            select: { id: true, nom: true },
          },
        },
      });
    });
  }

  // Retire un membre de l'école
  async removeMember(ecoleId: string, userId: string) {
    await this.findOne(ecoleId);

    return this.prisma.ecole.update({
      where: { id: ecoleId },
      data: {
        user: {
          disconnect: { id: userId },
        },
      },
    });
  }
}
