import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adapter le chemin selon votre projet
import {
  CreateClasseMatiereDto,
  UpdateClasseMatiereDto,
  ClasseMatiereQueryDto,
} from './dto/classe-matirere.dto';

@Injectable()
export class ClasseMatiereService {
  constructor(private readonly prisma: PrismaService) {}
  private async validateRelations(
    ecoleId: string,
    dto: {
      classeScolaireId?: string;
      matiereId?: string;
      uniteEnseignementId?: string | null;
    },
  ) {
    if (dto.classeScolaireId) {
      const classe = await this.prisma.classscolaire.findFirst({
        where: {
          id: dto.classeScolaireId,
          niveauscolaire: { ecoleId },
        },
      });
      if (!classe) {
        throw new BadRequestException(
          "La classe spécifiée est introuvable ou n'appartient pas à cette école.",
        );
      }
    }

    if (dto.matiereId) {
      const matiere = await this.prisma.matiere.findFirst({
        where: {
          id: dto.matiereId,
          ecoleId,
        },
      });
      if (!matiere) {
        throw new BadRequestException(
          "La matière spécifiée est introuvable ou n'appartient pas à cette école.",
        );
      }
    }

    if (dto.uniteEnseignementId) {
      const ue = await this.prisma.uniteenseignement.findUnique({
        where: { id: dto.uniteEnseignementId },
      });
      if (!ue) {
        throw new BadRequestException(
          "L'unité d'enseignement spécifiée est introuvable.",
        );
      }
    }
  }
  //Créer une relation entre une classe et une matiere
  async create(ecoleId: string, dto: CreateClasseMatiereDto) {
    //Vérifie que la classe, la matière et l'UE existent et appartiennent à l'école.
    await this.validateRelations(ecoleId, dto);

    //vérifie s'il existe déjà une relation entre cette classe et cette matière.
    const existingRelation = await this.prisma.classematirere.findUnique({
      where: {
        classeScolaireId_matiereId: {
          classeScolaireId: dto.classeScolaireId,
          matiereId: dto.matiereId,
        },
      },
    });

    if (existingRelation) {
      throw new ConflictException(
        'Cette matière est déjà associée à cette classe.',
      );
    }

    return this.prisma.classematirere.create({
      data: {
        classeScolaireId: dto.classeScolaireId,
        matiereId: dto.matiereId,
        uniteEnseignementId: dto.uniteEnseignementId,
        coefficient: dto.coefficient,
      },
      include: {
        classscolaire: true,
        matiere: true,
        uniteenseignement: true,
      },
    });
  }

  //Lister toutes les relations classes matières pour une école.
  async findAll(ecoleId: string, query: ClasseMatiereQueryDto) {
    const { classeScolaireId, matiereId, uniteEnseignementId, page, limit } =
      query;
    const skip = (page - 1) * limit;

    const existEcole = await this.prisma.ecole.findUnique({
      where: { id: ecoleId },
    });

    if (!existEcole) {
      throw new NotFoundException(`Cette école n'existe pas`);
    }
    const where = {
      classscolaire: {
        niveauscolaire: {
          ecoleId,
        },
      },
      ...(classeScolaireId && { classeScolaireId }),
      ...(matiereId && { matiereId }),
      ...(uniteEnseignementId && { uniteEnseignementId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.classematirere.findMany({
        where,
        skip,
        take: limit,
        include: {
          classscolaire: true,
          matiere: true,
          uniteenseignement: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.classematirere.count({ where }),
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

  //trouver une relation classe matière par son Id dans une école.
  async findOne(ecoleId: string, id: string) {
    const existEcole = await this.prisma.ecole.findUnique({
      where: { id: ecoleId },
    });

    if (!existEcole) {
      throw new NotFoundException(`Cette école n'existe pas`);
    }
    const classeMatiere = await this.prisma.classematirere.findFirst({
      where: {
        id,
        classscolaire: {
          niveauscolaire: {
            ecoleId,
          },
        },
      },
      include: {
        classscolaire: true,
        matiere: true,
        uniteenseignement: true,
      },
    });

    if (!classeMatiere) {
      throw new NotFoundException(
        `Association classe-matière introuvable pour cette école.`,
      );
    }

    return classeMatiere;
  }

  //mettre à jour une relation entre une classe et une matiere dans une ecole.
  async update(ecoleId: string, id: string, dto: UpdateClasseMatiereDto) {
    const current = await this.findOne(ecoleId, id);

    const targetClasseId = dto.classeScolaireId ?? current.classeScolaireId;
    const targetMatiereId = dto.matiereId ?? current.matiereId;

    if (dto.classeScolaireId || dto.matiereId || dto.uniteEnseignementId) {
      await this.validateRelations(ecoleId, {
        classeScolaireId: targetClasseId,
        matiereId: targetMatiereId,
        uniteEnseignementId:
          dto.uniteEnseignementId !== undefined
            ? dto.uniteEnseignementId
            : current.uniteEnseignementId,
      });
    }

    if (
      (dto.classeScolaireId || dto.matiereId) &&
      (targetClasseId !== current.classeScolaireId ||
        targetMatiereId !== current.matiereId)
    ) {
      const duplicate = await this.prisma.classematirere.findUnique({
        where: {
          classeScolaireId_matiereId: {
            classeScolaireId: targetClasseId,
            matiereId: targetMatiereId,
          },
        },
      });

      if (duplicate && duplicate.id !== id) {
        throw new ConflictException(
          'Une association existe déjà entre cette classe et cette matière.',
        );
      }
    }

    return this.prisma.classematirere.update({
      where: { id },
      data: dto,
      include: {
        classscolaire: true,
        matiere: true,
        uniteenseignement: true,
      },
    });
  }

  //supprimer une relation classe matiere dans une ecole.
  async remove(ecoleId: string, id: string) {
    await this.findOne(ecoleId, id);

    return this.prisma.classematirere.delete({
      where: { id },
    });
  }
}
