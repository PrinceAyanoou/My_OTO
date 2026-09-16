import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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

  async create(ecoleId: string, dto: CreateClasseMatiereDto) {
    await this.validateRelations(ecoleId, dto);

    const existingRelation = await this.prisma.classematirere.findFirst({
      where: {
        classeScolaireId: dto.classeScolaireId,
        matiereId: dto.matiereId,
        classscolaire: {
          niveauscolaire: { ecoleId },
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

  async findAll(ecoleId: string, query: ClasseMatiereQueryDto) {
    const { classeScolaireId, matiereId, uniteEnseignementId } = query;
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, query.limit || 10);
    const skip = (page - 1) * limit;

    const existEcole = await this.prisma.ecole.findUnique({
      where: { id: ecoleId },
    });

    if (!existEcole) {
      throw new NotFoundException(`L'école spécifiée n'existe pas.`);
    }

    const where = {
      classscolaire: {
        niveauscolaire: { ecoleId },
      },
      matiere: { ecoleId },
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

  async findOne(ecoleId: string, id: string) {
    const classeMatiere = await this.prisma.classematirere.findFirst({
      where: {
        id,
        classscolaire: {
          niveauscolaire: { ecoleId },
        },
        matiere: { ecoleId },
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
      const duplicate = await this.prisma.classematirere.findFirst({
        where: {
          classeScolaireId: targetClasseId,
          matiereId: targetMatiereId,
          classscolaire: {
            niveauscolaire: { ecoleId },
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
      where: { id: current.id },
      data: dto,
      include: {
        classscolaire: true,
        matiere: true,
        uniteenseignement: true,
      },
    });
  }

  async remove(ecoleId: string, id: string) {
    const current = await this.findOne(ecoleId, id);

    return this.prisma.classematirere.delete({
      where: { id: current.id },
    });
  }
}
