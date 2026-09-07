import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEvaluationDto, UpdateEvaluationDto } from './dto/evaluation.dto';

@Injectable()
export class EvaluationService {
  constructor(private readonly prisma: PrismaService) {}

  //Créer une nouvelle évaluation
  async create(dto: CreateEvaluationDto, ecoleId: string) {
    await this.validateRelations(
      dto.affectationId,
      dto.typeEvaluationId,
      dto.periodeScolaireId,
      ecoleId,
    );

    return this.prisma.evaluation.create({
      data: {
        ...dto,
        date: new Date(dto.date), // Conversion de "2026-09-07" en objet Date JS
      },
      include: {
        typeevaluation: true,
        periodescolaire: true,
        affectationenseignant: {
          include: {
            matiere: true,
            classscolaire: true,
            employe: { include: { user: true } },
          },
        },
      },
    });
  }

  //Lister toutes les évaluations d'une école (avec filtres optionnels)
  async findAllBySchool(
    ecoleId: string,
    filters?: {
      classeScolaireId?: string;
      periodeScolaireId?: string;
      matiereId?: string;
    },
  ) {
    return this.prisma.evaluation.findMany({
      where: {
        periodescolaire: { anneescolaire: { ecoleId } },
        ...(filters?.periodeScolaireId
          ? { periodeScolaireId: filters.periodeScolaireId }
          : {}),
        ...(filters?.classeScolaireId
          ? {
              affectationenseignant: {
                classeScolaireId: filters.classeScolaireId,
              },
            }
          : {}),
        ...(filters?.matiereId
          ? { affectationenseignant: { matiereId: filters.matiereId } }
          : {}),
      },
      include: {
        typeevaluation: true,
        periodescolaire: true,
        affectationenseignant: {
          include: {
            matiere: true,
            classscolaire: true,
          },
        },
        _count: { select: { note: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  //Récupérer une évaluation avec ses détails et ses notes
  async findOne(id: string, ecoleId: string) {
    const evaluation = await this.prisma.evaluation.findFirst({
      where: {
        id,
        periodescolaire: { anneescolaire: { ecoleId } },
      },
      include: {
        typeevaluation: true,
        periodescolaire: true,
        affectationenseignant: {
          include: {
            matiere: true,
            classscolaire: true,
            employe: { include: { user: true } },
          },
        },
        note: {
          include: {
            inscription: {
              include: { apprenant: true },
            },
          },
        },
      },
    });

    if (!evaluation) {
      throw new NotFoundException(`Évaluation introuvable dans cette école.`);
    }

    return evaluation;
  }

  //Mettre à jour une évaluation
  async update(id: string, dto: UpdateEvaluationDto, ecoleId: string) {
    const evaluation = await this.findOne(id, ecoleId);

    const affectationId = dto.affectationId ?? evaluation.affectationId;
    const typeEvaluationId =
      dto.typeEvaluationId ?? evaluation.typeEvaluationId;
    const periodeScolaireId =
      dto.periodeScolaireId ?? evaluation.periodeScolaireId;

    await this.validateRelations(
      affectationId,
      typeEvaluationId,
      periodeScolaireId,
      ecoleId,
    );

    return this.prisma.evaluation.update({
      where: { id },
      data: dto,
      include: {
        typeevaluation: true,
        periodescolaire: true,
        affectationenseignant: {
          include: {
            matiere: true,
            classscolaire: true,
          },
        },
      },
    });
  }

  //Supprimer une évaluation
  async remove(id: string, ecoleId: string) {
    const evaluation = await this.findOne(id, ecoleId);

    if (evaluation.note?.length > 0) {
      throw new BadRequestException(
        `Impossible de supprimer une évaluation contenant déjà ${evaluation.note.length} note(s) saisie(s). Supprimez d'abord les notes.`,
      );
    }

    return this.prisma.evaluation.delete({
      where: { id },
    });
  }

  // Valide la cohérence des clés étrangères et leur appartenance à l'école
  private async validateRelations(
    affectationId: string,
    typeEvaluationId: string,
    periodeScolaireId: string,
    ecoleId: string,
  ) {
    const affectation = await this.prisma.affectationenseignant.findFirst({
      where: { id: affectationId, anneescolaire: { ecoleId } },
    });
    if (!affectation) {
      throw new NotFoundException(
        "L'affectation enseignant est introuvable ou n'appartient pas à cette école.",
      );
    }

    const typeEval = await this.prisma.typeevaluation.findFirst({
      where: { id: typeEvaluationId, ecoleId },
    });
    if (!typeEval) {
      throw new NotFoundException(
        "Le type d'évaluation est introuvable pour cette école.",
      );
    }

    const periode = await this.prisma.periodescolaire.findFirst({
      where: { id: periodeScolaireId, anneescolaire: { ecoleId } },
    });
    if (!periode) {
      throw new NotFoundException(
        'La période scolaire est introuvable pour cette école.',
      );
    }
  }
}
