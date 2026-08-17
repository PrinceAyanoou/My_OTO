import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AnneeScolaireService } from '../annee-scolaire/annee-scolaire.service';
import {
  CreatePeriodeScolaireDto,
  UpdatePeriodeScolaireDto,
  ChangeStatutPeriodeDto,
  QueryPeriodeScolaireDto,
} from './dto/periode-scolaire.dto';
import { periodescolaire_statut, Prisma } from 'src/generated/prisma/client';

@Injectable()
export class PeriodeScolaireService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly anneeScolaireService: AnneeScolaireService,
  ) {}

  //Vérifie que les dates de la période sont incluses dans les bornes de l'année scolaire
  //
  private validateDatesInAnneeBounds(
    periodeDebut: Date,
    periodeFin: Date,
    anneeDebut: Date,
    anneeFin: Date,
  ) {
    const pDebut = new Date(periodeDebut).getTime();
    const pFin = new Date(periodeFin).getTime();
    const aDebut = new Date(anneeDebut).getTime();
    const aFin = new Date(anneeFin).getTime();

    if (pDebut < aDebut || pFin > aFin) {
      throw new BadRequestException(
        `Les dates de la période doivent être comprises dans l'intervalle de l'année scolaire (${new Date(anneeDebut).toLocaleDateString()} - ${new Date(anneeFin).toLocaleDateString()}).`,
      );
    }
  }

  // Créer une nouvelle période scolaire au sein d'une année scolaire
  async create(
    ecoleId: string,
    anneeScolaireId: string,
    dto: CreatePeriodeScolaireDto,
  ) {
    // Récupérer l'année scolaire et vérifier son existence dans l'école.
    const anneeScolaire = await this.anneeScolaireService.findOne(
      ecoleId,
      anneeScolaireId,
    );

    // Valider l'inclusion des dates dans l'année scolaire
    this.validateDatesInAnneeBounds(
      new Date(dto.dateDebut),
      new Date(dto.dateFin),
      anneeScolaire.dateDebut,
      anneeScolaire.dateFin,
    );

    // Vérifier l'unicité du nom ou de l'ordre
    const existing = await this.prisma.periodescolaire.findFirst({
      where: {
        annneScolaireId: anneeScolaireId,
        OR: [{ nom: dto.nom }, { ordre: dto.ordre }],
      },
    });

    if (existing) {
      throw new ConflictException(
        `Une période scolaire avec le nom "${dto.nom}" ou l'ordre ${dto.ordre} existe déjà pour cette année scolaire.`,
      );
    }

    // Transaction avec gestion des statuts
    return this.prisma.$transaction(async (tx) => {
      if (dto.statut === periodescolaire_statut.OUVERTE) {
        await tx.periodescolaire.updateMany({
          where: {
            annneScolaireId: anneeScolaireId,
            statut: periodescolaire_statut.OUVERTE,
          },
          data: { statut: periodescolaire_statut.CLOTUREE },
        });
      }

      const { dateDebut, dateFin, ...rest } = dto;
      return tx.periodescolaire.create({
        data: {
          dateDebut: new Date(dateDebut),
          dateFin: new Date(dateFin),
          ...rest,
          annneScolaireId: anneeScolaireId,
        },
      });
    });
  }

  // Lister les périodes scolaires
  async findAll(
    ecoleId: string,
    anneeScolaireId: string,
    query: QueryPeriodeScolaireDto,
  ) {
    await this.anneeScolaireService.findOne(ecoleId, anneeScolaireId);

    const { page = 1, limit = 10, search, statut } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.periodescolaireWhereInput = {
      annneScolaireId: anneeScolaireId,
      ...(statut && { statut }),
      ...(search && {
        nom: {
          contains: search,
        },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.periodescolaire.findMany({
        where,
        skip,
        take: limit,
        orderBy: { ordre: 'asc' },
        include: {
          _count: {
            select: {
              evaluation: true,
              bulletin: true,
              note: true,
            },
          },
        },
      }),
      this.prisma.periodescolaire.count({ where }),
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

  // Récupérer les détails d'une période scolaire par ID
  async findOne(ecoleId: string, anneeScolaireId: string, periodeId: string) {
    await this.anneeScolaireService.findOne(ecoleId, anneeScolaireId);

    const periode = await this.prisma.periodescolaire.findFirst({
      where: { id: periodeId, annneScolaireId: anneeScolaireId },
      include: {
        _count: {
          select: {
            evaluation: true,
            bulletin: true,
            note: true,
          },
        },
      },
    });

    if (!periode) {
      throw new NotFoundException(
        'Période scolaire introuvable pour cette année scolaire.',
      );
    }

    return periode;
  }

  // Mettre à jour une période scolaire
  async update(
    ecoleId: string,
    anneeScolaireId: string,
    periodeId: string,
    dto: UpdatePeriodeScolaireDto,
  ) {
    const anneeScolaire = await this.anneeScolaireService.findOne(
      ecoleId,
      anneeScolaireId,
    );
    const currentPeriode = await this.findOne(
      ecoleId,
      anneeScolaireId,
      periodeId,
    );

    // Déterminer les dates cibles (modifiées ou existantes)
    const targetDateDebut = dto.dateDebut
      ? new Date(dto.dateDebut)
      : currentPeriode.dateDebut;
    const targetDateFin = dto.dateFin
      ? new Date(dto.dateFin)
      : currentPeriode.dateFin;

    // Valider la cohérence des dates par rapport à l'année scolaire
    this.validateDatesInAnneeBounds(
      targetDateDebut,
      targetDateFin,
      anneeScolaire.dateDebut,
      anneeScolaire.dateFin,
    );

    if (
      (dto.nom && dto.nom !== currentPeriode.nom) ||
      (dto.ordre && dto.ordre !== currentPeriode.ordre)
    ) {
      const duplicate = await this.prisma.periodescolaire.findFirst({
        where: {
          annneScolaireId: anneeScolaireId,
          id: { not: periodeId },
          OR: [
            ...(dto.nom ? [{ nom: dto.nom }] : []),
            ...(dto.ordre ? [{ ordre: dto.ordre }] : []),
          ],
        },
      });

      if (duplicate) {
        throw new ConflictException(
          'Une autre période scolaire possède déjà ce nom ou cet ordre.',
        );
      }
    }

    if (dto.statut === periodescolaire_statut.OUVERTE) {
      await this.prisma.periodescolaire.updateMany({
        where: {
          annneScolaireId: anneeScolaireId,
          statut: periodescolaire_statut.OUVERTE,
          id: { not: periodeId },
        },
        data: { statut: periodescolaire_statut.CLOTUREE },
      });
    }

    const { dateDebut, dateFin, ...rest } = dto;

    return this.prisma.periodescolaire.update({
      where: { id: periodeId },
      data: {
        ...rest,
        ...(dateDebut && { dateDebut: new Date(dateDebut) }),
        ...(dateFin && { dateFin: new Date(dateFin) }),
      },
    });
  }

  // Changer le statut de la période
  async changeStatut(
    ecoleId: string,
    anneeScolaireId: string,
    periodeId: string,
    dto: ChangeStatutPeriodeDto,
  ) {
    await this.findOne(ecoleId, anneeScolaireId, periodeId);

    if (dto.statut === periodescolaire_statut.OUVERTE) {
      await this.prisma.periodescolaire.updateMany({
        where: {
          annneScolaireId: anneeScolaireId,
          statut: periodescolaire_statut.OUVERTE,
          id: { not: periodeId },
        },
        data: { statut: periodescolaire_statut.CLOTUREE },
      });
    }

    return this.prisma.periodescolaire.update({
      where: { id: periodeId },
      data: { statut: dto.statut },
    });
  }

  // Supprimer une période scolaire
  async remove(ecoleId: string, anneeScolaireId: string, periodeId: string) {
    const periode = await this.findOne(ecoleId, anneeScolaireId, periodeId);

    if (periode.statut === periodescolaire_statut.OUVERTE) {
      throw new BadRequestException(
        'Impossible de supprimer cette période scolaire car elle est en cours.',
      );
    }

    const { evaluation, bulletin, note } = periode._count;
    if (evaluation > 0 || bulletin > 0 || note > 0) {
      throw new BadRequestException(
        'Impossible de supprimer cette période car des évaluations, bulletins ou notes y sont liés.',
      );
    }

    return this.prisma.periodescolaire.delete({
      where: { id: periodeId },
    });
  }
}
