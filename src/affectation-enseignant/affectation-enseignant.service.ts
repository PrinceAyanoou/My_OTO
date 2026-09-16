import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import {
  CreateAffectationEnseignantDto,
  UpdateAffectationEnseignantDto,
  AffectationEnseignantQueryDto,
} from './dto/affectation-enseignant.dto';

@Injectable()
export class AffectationEnseignantService {
  constructor(private readonly prisma: PrismaService) {}

  // Utilitaire privé pour valider l'appartenance des relations à l'école
  private async validateEntitiesBelongToSchool(
    ecoleId: string,
    entities: {
      employeId?: string;
      classeScolaireId?: string;
      matiereId?: string;
      anneeScolaireId?: string;
    },
  ) {
    const checks: Promise<any>[] = [];

    if (entities.employeId) {
      checks.push(
        this.prisma.employe
          .findFirst({
            where: { id: entities.employeId, ecoleId },
          })
          .then((res) => {
            if (!res)
              throw new NotFoundException(
                `Employé introuvable pour cette école.`,
              );
          }),
      );
    }

    if (entities.classeScolaireId) {
      checks.push(
        this.prisma.classscolaire
          .findFirst({
            where: {
              id: entities.classeScolaireId,
              niveauscolaire: { ecoleId },
            },
          })
          .then((res) => {
            if (!res)
              throw new NotFoundException(
                `Classe introuvable pour cette école.`,
              );
          }),
      );
    }

    if (entities.matiereId) {
      checks.push(
        this.prisma.matiere
          .findFirst({
            where: { id: entities.matiereId, ecoleId },
          })
          .then((res) => {
            if (!res)
              throw new NotFoundException(
                `Matière introuvable pour cette école.`,
              );
          }),
      );
    }

    if (entities.anneeScolaireId) {
      checks.push(
        this.prisma.anneescolaire
          .findFirst({
            where: { id: entities.anneeScolaireId, ecoleId },
          })
          .then((res) => {
            if (!res)
              throw new NotFoundException(
                `Année scolaire introuvable pour cette école.`,
              );
          }),
      );
    }

    await Promise.all(checks);
  }

  async create(ecoleId: string, dto: CreateAffectationEnseignantDto) {
    // 1. Validation de toutes les clés étrangères simultanément
    await this.validateEntitiesBelongToSchool(ecoleId, dto);

    // 2. Tenter la création et intercepter l'erreur d'unicité Prisma (évite la race condition)
    try {
      return await this.prisma.affectationenseignant.create({
        data: {
          employeId: dto.employeId,
          classeScolaireId: dto.classeScolaireId,
          matiereId: dto.matiereId,
          anneeScolaireId: dto.anneeScolaireId,
        },
        include: {
          employe: {
            include: {
              user: { select: { nom: true, prenoms: true, email: true } },
            },
          },
          classscolaire: { select: { id: true, nom: true } },
          matiere: { select: { id: true, nom: true, CodeMat: true } },
          anneescolaire: { select: { id: true, nom: true } },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Une affectation existe déjà pour cette matière dans cette classe pour cette année scolaire.`,
        );
      }
      throw error;
    }
  }

  async findAll(ecoleId: string, query: AffectationEnseignantQueryDto) {
    const {
      page = 1,
      limit = 10,
      employeId,
      classeScolaireId,
      matiereId,
      anneeScolaireId,
    } = query;
    const skip = (page - 1) * limit;

    const where = {
      employe: { ecoleId },
      ...(employeId && { employeId }),
      ...(classeScolaireId && { classeScolaireId }),
      ...(matiereId && { matiereId }),
      ...(anneeScolaireId && { anneeScolaireId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.affectationenseignant.findMany({
        where,
        skip,
        take: limit,
        include: {
          employe: {
            include: {
              user: { select: { nom: true, prenoms: true, email: true } },
            },
          },
          classscolaire: { select: { id: true, nom: true } },
          matiere: { select: { id: true, nom: true, CodeMat: true } },
          anneescolaire: { select: { id: true, nom: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.affectationenseignant.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(ecoleId: string, id: string) {
    const affectation = await this.prisma.affectationenseignant.findFirst({
      where: {
        id,
        employe: { ecoleId },
      },
      include: {
        employe: {
          include: {
            user: { select: { nom: true, prenoms: true, email: true } },
          },
        },
        classscolaire: { select: { id: true, nom: true } },
        matiere: { select: { id: true, nom: true, CodeMat: true } },
        anneescolaire: { select: { id: true, nom: true } },
        emploidutemps: true,
        evaluation: true,
      },
    });

    if (!affectation) {
      throw new NotFoundException(
        `L'affectation avec l'ID ${id} est introuvable pour cette école.`,
      );
    }

    return affectation;
  }

  async update(
    ecoleId: string,
    id: string,
    dto: UpdateAffectationEnseignantDto,
  ) {
    // Vérifie l'existence et la propriété de l'affectation au tenant
    const current = await this.findOne(ecoleId, id);

    // Sécurité tenant : Valide toute nouvelle entité fournie dans le DTO
    await this.validateEntitiesBelongToSchool(ecoleId, dto);

    const targetMatiereId = dto.matiereId ?? current.matiereId;
    const targetClasseId = dto.classeScolaireId ?? current.classeScolaireId;
    const targetAnneeId = dto.anneeScolaireId ?? current.anneeScolaireId;

    if (dto.matiereId || dto.classeScolaireId || dto.anneeScolaireId) {
      const existing = await this.prisma.affectationenseignant.findFirst({
        where: {
          matiereId: targetMatiereId,
          classeScolaireId: targetClasseId,
          anneeScolaireId: targetAnneeId,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Une autre affectation existe déjà pour ces paramètres.`,
        );
      }
    }

    return this.prisma.affectationenseignant.update({
      where: { id },
      data: dto,
      include: {
        employe: {
          include: {
            user: { select: { nom: true, prenoms: true, email: true } },
          },
        },
        classscolaire: { select: { id: true, nom: true } },
        matiere: { select: { id: true, nom: true, CodeMat: true } },
        anneescolaire: { select: { id: true, nom: true } },
      },
    });
  }

  async remove(ecoleId: string, id: string) {
    await this.findOne(ecoleId, id);

    await this.prisma.affectationenseignant.delete({
      where: { id },
    });

    return { message: 'Affectation supprimée avec succès.' };
  }
}
