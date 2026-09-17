import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import {
  CreateEmploiDuTempsDto,
  QueryEmploiDuTempsDto,
  UpdateEmploiDuTempsDto,
} from './dto/emploi-du-temp.dto';

@Injectable()
export class EmploiDuTempsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly include = {
    affectationenseignant: {
      include: {
        employe: {
          include: {
            user: { select: { nom: true, prenoms: true, email: true } },
          },
        },
        matiere: true,
      },
    },
    classscolaire: true,
  } satisfies Prisma.emploidutempsInclude;

  private async findAffectationInSchool(
    ecoleId: string,
    affectationEnseignantId: string,
  ) {
    const affectation = await this.prisma.affectationenseignant.findFirst({
      where: {
        id: affectationEnseignantId,
        employe: { ecoleId },
      },
    });

    if (!affectation) {
      throw new NotFoundException(
        "L'affectation enseignant est introuvable pour cette école.",
      );
    }

    return affectation;
  }

  private async validateClassInSchool(
    ecoleId: string,
    classeScolaireId: string,
  ) {
    const classe = await this.prisma.classscolaire.findFirst({
      where: {
        id: classeScolaireId,
        niveauscolaire: { ecoleId },
      },
    });

    if (!classe) {
      throw new NotFoundException(
        'La classe scolaire est introuvable pour cette école.',
      );
    }
  }

  async create(ecoleId: string, dto: CreateEmploiDuTempsDto) {
    const affectation = await this.findAffectationInSchool(
      ecoleId,
      dto.affectationEnseignantId,
    );
    await this.validateClassInSchool(ecoleId, dto.classeScolaireId);

    if (affectation.classeScolaireId !== dto.classeScolaireId) {
      throw new ConflictException(
        "La classe du créneau doit correspondre à celle de l'affectation.",
      );
    }

    try {
      return await this.prisma.emploidutemps.create({
        data: {
          ...dto,
          jourDeLaSemaine: dto.jourDeLaSemaine,
        },
        include: this.include,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Un créneau existe déjà pour cette affectation, ce jour et cette heure de début.',
        );
      }
      throw error;
    }
  }

  async findAll(ecoleId: string, query: QueryEmploiDuTempsDto) {
    return this.prisma.emploidutemps.findMany({
      where: {
        affectationenseignant: { employe: { ecoleId } },
        ...(query.classeScolaireId && {
          classeScolaireId: query.classeScolaireId,
        }),
        ...(query.affectationEnseignantId && {
          affectationEnseignantId: query.affectationEnseignantId,
        }),
        ...(query.jourDeLaSemaine && {
          jourDeLaSemaine: query.jourDeLaSemaine,
        }),
      },
      include: this.include,
      orderBy: [{ jourDeLaSemaine: 'asc' }, { heureDebut: 'asc' }],
    });
  }

  async findOne(ecoleId: string, id: string) {
    const emploi = await this.prisma.emploidutemps.findFirst({
      where: {
        id,
        affectationenseignant: { employe: { ecoleId } },
      },
      include: this.include,
    });

    if (!emploi) {
      throw new NotFoundException(
        `L'emploi du temps avec l'ID ${id} est introuvable.`,
      );
    }

    return emploi;
  }

  async update(ecoleId: string, id: string, dto: UpdateEmploiDuTempsDto) {
    const current = await this.findOne(ecoleId, id);
    const affectationId =
      dto.affectationEnseignantId ?? current.affectationEnseignantId;
    const classeId = dto.classeScolaireId ?? current.classeScolaireId;
    const affectation = await this.findAffectationInSchool(
      ecoleId,
      affectationId,
    );
    await this.validateClassInSchool(ecoleId, classeId);

    if (affectation.classeScolaireId !== classeId) {
      throw new ConflictException(
        "La classe du créneau doit correspondre à celle de l'affectation.",
      );
    }

    try {
      return await this.prisma.emploidutemps.update({
        where: { id },
        data: {
          ...dto,
          ...(dto.jourDeLaSemaine && {
            jourDeLaSemaine: dto.jourDeLaSemaine,
          }),
        },
        include: this.include,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Ce créneau existe déjà.');
      }
      throw error;
    }
  }

  async remove(ecoleId: string, id: string) {
    await this.findOne(ecoleId, id);
    await this.prisma.emploidutemps.delete({ where: { id } });
    return { message: 'Créneau supprimé avec succès.' };
  }
}
