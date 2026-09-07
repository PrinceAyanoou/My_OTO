import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTypeEvaluationDto,
  UpdateTypeEvaluationDto,
} from './dto/type-evaluation.dto';

@Injectable()
export class TypeEvaluationService {
  constructor(private readonly prisma: PrismaService) {}

  // Créer un nouveau type d'évaluation pour une école
  async create(dto: CreateTypeEvaluationDto, ecoleId: string) {
    const existingType = await this.prisma.typeevaluation.findFirst({
      where: {
        nom: dto.nom,
        ecoleId,
      },
    });

    if (existingType) {
      throw new ConflictException(
        `Un type d'évaluation nommé "${dto.nom}" existe déjà dans cette école.`,
      );
    }

    return this.prisma.typeevaluation.create({
      data: {
        nom: dto.nom,
        ecoleId,
      },
    });
  }

  //Lister tous les types d'évaluation de l'école
  async findAllBySchool(ecoleId: string) {
    return this.prisma.typeevaluation.findMany({
      where: { ecoleId },
      include: {
        _count: {
          select: {
            evaluation: true,
            regleevaluation: true,
          },
        },
      },
      orderBy: { nom: 'asc' },
    });
  }

  //Récupérer un type d'évaluation spécifique par son ID
  async findOne(id: string, ecoleId: string) {
    const typeEvaluation = await this.prisma.typeevaluation.findFirst({
      where: { id, ecoleId },
      include: {
        _count: {
          select: {
            evaluation: true,
            note: true,
          },
        },
      },
    });

    if (!typeEvaluation) {
      throw new NotFoundException(
        `Type d'évaluation introuvable dans cette école.`,
      );
    }

    return typeEvaluation;
  }

  //Mettre à jour un type d'évaluation
  async update(id: string, dto: UpdateTypeEvaluationDto, ecoleId: string) {
    await this.findOne(id, ecoleId);

    if (dto.nom) {
      const duplicate = await this.prisma.typeevaluation.findFirst({
        where: {
          nom: dto.nom,
          ecoleId,
          NOT: { id },
        },
      });

      if (duplicate) {
        throw new ConflictException(
          `Un autre type d'évaluation porte déjà le nom "${dto.nom}".`,
        );
      }
    }

    return this.prisma.typeevaluation.update({
      where: { id },
      data: dto,
    });
  }

  //Supprimer un type d'évaluation
  async remove(id: string, ecoleId: string) {
    const typeEvaluation = await this.findOne(id, ecoleId);

    // Vérifier si le type d'évaluation est déjà utilisé dans des évaluations
    if (typeEvaluation._count?.evaluation > 0) {
      throw new BadRequestException(
        `Impossible de supprimer ce type d'évaluation car il est associé à ${typeEvaluation._count.evaluation} évaluation(s) existante(s).`,
      );
    }

    return this.prisma.typeevaluation.delete({
      where: { id },
    });
  }
}
