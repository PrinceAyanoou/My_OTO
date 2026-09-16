import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateAnneeScolaireDto,
  UpdateAnneeScolaireDto,
  ChangeStatutAnneeScolaireDto,
  QueryAnneeScolaireDto,
} from './dto/annee-scolaire.dto';
import { Prisma } from 'src/generated/prisma/client';
import { anneescolaire_statut } from 'src/generated/prisma/enums';

@Injectable()
export class AnneeScolaireService {
  constructor(private readonly prisma: PrismaService) {}

  // créer une nouvelle année scolaire dans l'école.
  async create(ecoleId: string, dto: CreateAnneeScolaireDto) {
    // Vérifier si l'école existe
    const ecole = await this.prisma.ecole.findUnique({
      where: { id: ecoleId },
    });
    if (!ecole) {
      throw new NotFoundException('École introuvable.');
    }

    // vérifier si ce nom d'année scolaire n'existe pas déjà pour cette école.
    const existingNom = await this.prisma.anneescolaire.findUnique({
      where: {
        nom_ecoleId: {
          nom: dto.nom,
          ecoleId: ecoleId,
        },
      },
    });

    if (existingNom) {
      throw new ConflictException(
        `Une année scolaire nommée "${dto.nom}" existe déjà pour cette école.`,
      );
    }

    // Transaction atomique pour basculer les anciennes années si la nouvelle est EN_COURS et créer la ressource
    return this.prisma.$transaction(async (tx) => {
      if (dto.statut === anneescolaire_statut.EN_COURS) {
        await tx.anneescolaire.updateMany({
          where: { ecoleId, statut: anneescolaire_statut.EN_COURS },
          data: { statut: anneescolaire_statut.TERMINEE },
        });
      }
      const { dateDebut, dateFin, ...rest } = dto;
      return tx.anneescolaire.create({
        data: {
          dateDebut: new Date(dateDebut),
          dateFin: new Date(dateFin),
          ...rest,
          ecoleId,
        },
      });
    });
  }

  // Lister les années scolaires d'une école avec filtres et pagination.
  async findAll(ecoleId: string, query: QueryAnneeScolaireDto) {
    const { page = 1, limit = 10, search, statut } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.anneescolaireWhereInput = {
      ecoleId,
      ...(statut && { statut }),
      ...(search && {
        nom: {
          contains: search,
        },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.anneescolaire.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dateDebut: 'desc' },
        include: {
          _count: {
            select: {
              periodescolaire: true,
              inscription: true,
            },
          },
        },
      }),
      this.prisma.anneescolaire.count({ where }),
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

  // Récupérer les détails d'une année scolaire par ID.
  async findOne(ecoleId: string, anneescolaireId: string) {
    const anneeScolaire = await this.prisma.anneescolaire.findFirst({
      where: { id: anneescolaireId, ecoleId: ecoleId },
      include: {
        periodescolaire: {
          orderBy: { ordre: 'asc' },
        },
        _count: {
          select: {
            inscription: true,
            affectationenseignant: true,
            configurationscolarite: true,
          },
        },
      },
    });

    if (!anneeScolaire) {
      throw new NotFoundException(
        'Année scolaire introuvable pour cette école.',
      );
    }

    return anneeScolaire;
  }

  // Récupérer l'année scolaire actuellement active (EN_COURS) de l'école.
  async findCurrent(ecoleId: string) {
    const activeAnnee = await this.prisma.anneescolaire.findFirst({
      where: {
        ecoleId,
        statut: anneescolaire_statut.EN_COURS,
      },
      include: {
        periodescolaire: {
          orderBy: { ordre: 'asc' },
        },
      },
    });

    if (!activeAnnee) {
      throw new NotFoundException(
        'Aucune année scolaire active pour cette école.',
      );
    }

    return activeAnnee;
  }

  // Mettre à jour une année scolaire.
  async update(
    ecoleId: string,
    anneeScolaireId: string,
    dto: UpdateAnneeScolaireDto,
  ) {
    const currentAnnee = await this.findOne(ecoleId, anneeScolaireId);

    // Si mise à jour du nom, vérifier les doublons
    if (dto.nom && dto.nom !== currentAnnee.nom) {
      const duplicateNom = await this.prisma.anneescolaire.findUnique({
        where: {
          nom_ecoleId: {
            nom: dto.nom,
            ecoleId,
          },
        },
      });

      if (duplicateNom) {
        throw new ConflictException(
          `Une année scolaire avec le nom "${dto.nom}" existe déjà.`,
        );
      }
    }

    // Basculement atomique si passage du statut à EN_COURS
    return this.prisma.$transaction(async (tx) => {
      if (dto.statut === anneescolaire_statut.EN_COURS) {
        await tx.anneescolaire.updateMany({
          where: {
            ecoleId,
            statut: anneescolaire_statut.EN_COURS,
            id: { not: anneeScolaireId },
          },
          data: { statut: anneescolaire_statut.TERMINEE },
        });
      }

      return tx.anneescolaire.update({
        where: { id: anneeScolaireId },
        data: dto,
      });
    });
  }

  // Changer le statut de l'année scolaire.
  async changeStatut(
    ecoleId: string,
    anneeScolaireId: string,
    dto: ChangeStatutAnneeScolaireDto,
  ) {
    await this.findOne(ecoleId, anneeScolaireId);

    return this.prisma.$transaction(async (tx) => {
      if (dto.statut === anneescolaire_statut.EN_COURS) {
        await tx.anneescolaire.updateMany({
          where: {
            ecoleId,
            statut: anneescolaire_statut.EN_COURS,
            id: { not: anneeScolaireId },
          },
          data: { statut: anneescolaire_statut.TERMINEE },
        });
      }

      return tx.anneescolaire.update({
        where: { id: anneeScolaireId },
        data: { statut: dto.statut },
      });
    });
  }

  // Supprimer une année scolaire en isolant strictement le tenant.
  async remove(ecoleId: string, anneeScolaireId: string) {
    const annee = await this.findOne(ecoleId, anneeScolaireId);

    if (annee.statut === anneescolaire_statut.EN_COURS) {
      throw new BadRequestException(
        'Impossible de supprimer cette année scolaire car elle est en cours.',
      );
    }

    // Suppression sécurisée avec vérification combinée id et ecoleId
    const deleteResult = await this.prisma.anneescolaire.deleteMany({
      where: {
        id: anneeScolaireId,
        ecoleId: ecoleId,
      },
    });

    if (deleteResult.count === 0) {
      throw new NotFoundException(
        'Année scolaire introuvable pour cette école.',
      );
    }

    return { message: 'Année scolaire supprimée avec succès.' };
  }
}
