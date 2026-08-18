import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateUniteEnseignementDto,
  UpdateUniteEnseignementDto,
  QueryUniteEnseignementDto,
} from './dto/unite-enseignement.dto';

@Injectable()
export class UniteEnseignementService {
  constructor(private readonly prisma: PrismaService) {}

  //calculer le coefficents de l'ue automatiquement.
  private sumCoefficients(matieres: { coefficient: number }[]): number {
    return matieres.reduce((sum, m) => sum + m.coefficient, 0);
  }

  //Vérifier que toutes les matières appartiennent bien à l'école spécifiée
  private async validateMatieresBelongToEcole(
    ecoleId: string,
    matiereIds: string[],
  ) {
    const count = await this.prisma.matiere.count({
      where: {
        id: { in: matiereIds },
        ecoleId: ecoleId,
      },
    });

    if (count !== matiereIds.length) {
      throw new BadRequestException(
        `Une ou plusieurs matières spécifiées n'appartiennent pas à cette école.`,
      );
    }
  }

  // Créer une UE pour une école
  async create(ecoleId: string, dto: CreateUniteEnseignementDto) {
    const { nom, code, matieres } = dto;

    // Vérifier l'existence de l'école
    const ecole = await this.prisma.ecole.findUnique({
      where: { id: ecoleId },
    });
    if (!ecole) {
      throw new NotFoundException(`École introuvable.`);
    }

    // Vérifier si le code existe déjà pour cette école
    const existingUe = await this.prisma.uniteenseignement.findFirst({
      where: {
        code,
        matiereue: {
          some: {
            matiere: { ecoleId },
          },
        },
      },
    });
    if (existingUe) {
      throw new ConflictException(
        `Une UE avec le code "${code}" existe déjà dans cette école.`,
      );
    }

    // Vérifier que toutes les matières appartiennent à l'école
    if (matieres && matieres.length > 0) {
      const matiereIds = matieres.map((m) => m.matiereId);
      await this.validateMatieresBelongToEcole(ecoleId, matiereIds);
    }

    // Transaction globale
    return this.prisma.$transaction(async (tx) => {
      // Création simple de l'UE (nom + code)
      const newUe = await tx.uniteenseignement.create({
        data: {
          nom,
          code,
          coefficient: 0,
        },
      });

      // Récupération de l'ID généré dans la DB
      const ueId = newUe.id;

      let totalCoefficient = 0;

      // Association des matières et remplissage de matiereue
      if (matieres && matieres.length > 0) {
        totalCoefficient = this.sumCoefficients(matieres);

        await tx.matiereue.createMany({
          data: matieres.map((m) => ({
            uniteEnseignementId: ueId,
            matiereId: m.matiereId,
            coefficient: m.coefficient,
          })),
        });
      }

      // Mise à jour du coefficient global de l'UE et retour des données complètes
      return tx.uniteenseignement.update({
        where: { id: ueId },
        data: {
          coefficient: totalCoefficient,
        },
        include: {
          matiereue: {
            include: {
              matiere: true,
            },
          },
        },
      });
    });
  }

  //Lister les UE d'une école
  async findAllByEcole(ecoleId: string, query?: QueryUniteEnseignementDto) {
    const existEcole = await this.prisma.ecole.findUnique({
      where: { id: ecoleId },
    });

    if (!existEcole) {
      throw new NotFoundException(`Cette école n'existe pas`);
    }
    const { search } = query || {};

    const result = await this.prisma.uniteenseignement.findMany({
      where: {
        matiereue: {
          some: {
            matiere: {
              ecoleId: ecoleId,
            },
          },
        },
        ...(search && {
          OR: [{ nom: { contains: search } }, { code: { contains: search } }],
        }),
      },
      include: {
        matiereue: {
          include: {
            matiere: { select: { id: true, nom: true, CodeMat: true } },
          },
        },
      },
      orderBy: { nom: 'asc' },
    });

    if (result.length > 0) {
      return result;
    }
    throw new NotFoundException(`Pas de résultat associé à votre recherche`);
  }

  //Trouver une UE spécifique par ID et école
  async findOne(ecoleId: string, ueId: string) {
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
        matiereue: { include: { matiere: true } },
      },
    });

    if (!ue) {
      throw new NotFoundException(
        `Unité d'enseignement introuvable pour cette école.`,
      );
    }

    return ue;
  }

  // Mettre à jour une UE pour une école
  async update(ecoleId: string, ueId: string, dto: UpdateUniteEnseignementDto) {
    const currentUe = await this.findOne(ecoleId, ueId);

    const { nom, code, matieres } = dto;

    // Vérification du code unique au sein de l'école
    if (code && code !== currentUe.code) {
      const existingUe = await this.prisma.uniteenseignement.findFirst({
        where: {
          code: code,
          matiereue: {
            some: {
              matiere: {
                ecoleId: ecoleId,
              },
            },
          },
          NOT: { id: ueId },
        },
      });
      if (existingUe) {
        throw new ConflictException(
          `Une UE avec le code "${code}" existe déjà dans cette école.`,
        );
      }
    }

    // Validation des matières si fournies
    if (matieres !== undefined && matieres.length > 0) {
      const matiereIds = matieres.map((m) => m.matiereId);
      await this.validateMatieresBelongToEcole(ecoleId, matiereIds);
    }

    return this.prisma.$transaction(async (tx) => {
      let totalCoefficient = currentUe.coefficient;

      if (matieres !== undefined) {
        totalCoefficient = this.sumCoefficients(matieres);

        await tx.matiereue.deleteMany({
          where: { uniteEnseignementId: ueId },
        });

        if (matieres.length > 0) {
          await tx.matiereue.createMany({
            data: matieres.map((m) => ({
              uniteEnseignementId: ueId,
              matiereId: m.matiereId,
              coefficient: m.coefficient,
            })),
          });
        }
      }

      return tx.uniteenseignement.update({
        where: { id: ueId },
        data: {
          ...(nom && { nom }),
          ...(code && { code }),
          coefficient: totalCoefficient,
        },
        include: {
          matiereue: {
            include: { matiere: true },
          },
        },
      });
    });
  }

  //Supprimer une UE d'une école
  async remove(ecoleId: string, id: string) {
    await this.findOne(ecoleId, id);

    return this.prisma.uniteenseignement.delete({
      where: { id },
    });
  }
}
