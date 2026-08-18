import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddMatiereToUeDto,
  UpdateMatiereCoefficientDto,
} from './dto/matiereue.dto';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class MatiereUeService {
  constructor(private readonly prisma: PrismaService) {}

  // Recalcule et met à jour le coefficient total de l'UE
  private async recalculateUeCoefficient(
    tx: Prisma.TransactionClient,
    ueId: string,
  ) {
    const sum = await tx.matiereue.aggregate({
      where: { uniteEnseignementId: ueId },
      _sum: { coefficient: true },
    });

    const totalCoefficient = sum._sum.coefficient || 0;

    await tx.uniteenseignement.update({
      where: { id: ueId },
      data: { coefficient: totalCoefficient },
    });
  }

  // Ajouter une matière à une UE au sein d'une école
  async addMatiere(ecoleId: string, ueId: string, dto: AddMatiereToUeDto) {
    const { matiereId, coefficient } = dto;

    // Vérifier que l'UE existe et appartient à cette école
    const ue = await this.prisma.uniteenseignement.findFirst({
      where: {
        id: ueId,
        matiereue: {
          some: {
            matiere: {
              ecoleId: ecoleId,
            },
          },
        },
      },
    });
    if (!ue) {
      throw new NotFoundException(
        `Unité d'enseignement introuvable pour cette école.`,
      );
    }

    // Vérifier que la matière existe et appartient à la même école
    const matiere = await this.prisma.matiere.findFirst({
      where: { id: matiereId, ecoleId: ecoleId },
    });
    if (!matiere) {
      throw new NotFoundException(`Matière introuvable pour cette école.`);
    }

    // Vérifier si la relation existe déjà
    const existingRelation = await this.prisma.matiereue.findUnique({
      where: {
        uniteEnseignementId_matiereId: {
          uniteEnseignementId: ueId,
          matiereId,
        },
      },
    });
    if (existingRelation) {
      throw new ConflictException(
        `Cette matière est déjà associée à cette UE.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const relation = await tx.matiereue.create({
        data: {
          uniteEnseignementId: ueId,
          matiereId,
          coefficient,
        },
        include: {
          matiere: true,
          uniteenseignement: true,
        },
      });

      await this.recalculateUeCoefficient(tx, ueId);

      return relation;
    });
  }

  // Retirer une matière d'une UE
  async removeMatiere(ecoleId: string, ueId: string, matiereId: string) {
    const relation = await this.prisma.matiereue.findFirst({
      where: {
        uniteEnseignementId: ueId,
        matiereId: matiereId,
        uniteenseignement: {
          matiereue: {
            some: {
              matiere: {
                ecoleId: ecoleId,
              },
            },
          },
        },
      },
    });

    if (!relation) {
      throw new NotFoundException(
        `Association entre cette matière et cette UE introuvable pour cette école.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const deleted = await tx.matiereue.delete({
        where: {
          uniteEnseignementId_matiereId: {
            uniteEnseignementId: ueId,
            matiereId,
          },
        },
      });

      await this.recalculateUeCoefficient(tx, ueId);

      return deleted;
    });
  }

  // Modifier le coefficient d'une matière dans une UE
  async updateMatiereCoefficient(
    ecoleId: string,
    ueId: string,
    matiereId: string,
    dto: UpdateMatiereCoefficientDto,
  ) {
    const relation = await this.prisma.matiereue.findFirst({
      where: {
        uniteEnseignementId: ueId,
        matiereId: matiereId,
        uniteenseignement: {
          matiereue: {
            some: {
              matiere: {
                ecoleId: ecoleId,
              },
            },
          },
        },
      },
    });

    if (!relation) {
      throw new NotFoundException(
        `Association entre cette matière et cette UE introuvable pour cette école.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.matiereue.update({
        where: {
          uniteEnseignementId_matiereId: {
            uniteEnseignementId: ueId,
            matiereId,
          },
        },
        data: { coefficient: dto.coefficient },
        include: {
          matiere: true,
          uniteenseignement: true,
        },
      });

      await this.recalculateUeCoefficient(tx, ueId);

      return updated;
    });
  }

  // Lister les matières d'une UE
  async findMatieresByUe(ecoleId: string, ueId: string) {
    const ue = await this.prisma.uniteenseignement.findFirst({
      where: {
        id: ueId,
        matiereue: {
          some: {
            matiere: {
              ecoleId: ecoleId,
            },
          },
        },
      },
      include: {
        matiereue: {
          include: {
            matiere: true,
          },
        },
      },
    });

    if (!ue) {
      throw new NotFoundException(
        `Unité d'enseignement introuvable pour cette école.`,
      );
    }

    return ue.matiereue;
  }
}
