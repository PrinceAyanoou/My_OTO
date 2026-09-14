import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRegleEvaluationDto,
  UpdateRegleEvaluationDto,
} from './dto/regle-evaluation.dto';

@Injectable()
export class RegleEvaluationService {
  constructor(private readonly prisma: PrismaService) {}

  // Créer une règle d'évaluation
  async create(dto: CreateRegleEvaluationDto, ecoleId: string) {
    // Vérifier si la politique existe et appartient à l'école
    const politique = await this.prisma.politiqueevaluation.findFirst({
      where: { id: dto.politiqueId, ecoleId },
    });

    if (!politique) {
      throw new NotFoundException(
        "La politique d'évaluation est introuvable pour cette école.",
      );
    }

    // Vérifier si le type d'évaluation existe et appartient à l'école
    const typeEvaluation = await this.prisma.typeevaluation.findFirst({
      where: { id: dto.typeEvaluationId, ecoleId },
    });

    if (!typeEvaluation) {
      throw new NotFoundException(
        "Le type d'évaluation est introuvable pour cette école.",
      );
    }

    // Vérifier la contrainte d'unicité (politiqueId, typeEvaluationId)
    const existingRegle = await this.prisma.regleevaluation.findUnique({
      where: {
        politiqueId_typeEvaluationId: {
          politiqueId: dto.politiqueId,
          typeEvaluationId: dto.typeEvaluationId,
        },
      },
    });

    if (existingRegle) {
      throw new ConflictException(
        "Une règle existe déjà pour ce type d'évaluation dans cette politique.",
      );
    }

    return this.prisma.regleevaluation.create({
      data: {
        politiqueId: dto.politiqueId,
        typeEvaluationId: dto.typeEvaluationId,
        nombreMin: dto.nombreMin,
        coefficientType: dto.coefficientType,
      },
      include: {
        typeevaluation: true,
      },
    });
  }

  // Récupérer toutes les règles associées à une politique d'évaluation
  async findByPolitique(politiqueId: string, ecoleId: string) {
    const politique = await this.prisma.politiqueevaluation.findFirst({
      where: { id: politiqueId, ecoleId },
    });

    if (!politique) {
      throw new NotFoundException(
        "La politique d'évaluation est introuvable pour cette école.",
      );
    }

    return this.prisma.regleevaluation.findMany({
      where: { politiqueId },
      include: {
        typeevaluation: true,
      },
    });
  }

  //Récupérer une règle par son ID
  async findOne(id: string, ecoleId: string) {
    const regle = await this.prisma.regleevaluation.findUnique({
      where: { id },
      include: {
        politiqueevaluation: true,
        typeevaluation: true,
      },
    });

    if (!regle) {
      throw new NotFoundException("La règle d'évaluation n'existe pas.");
    }

    if (regle.politiqueevaluation.ecoleId !== ecoleId) {
      throw new ForbiddenException(
        "Vous n'avez pas accès à cette règle d'évaluation.",
      );
    }

    return regle;
  }

  //Mettre à jour les paramètres d'une règle
  async update(id: string, dto: UpdateRegleEvaluationDto, ecoleId: string) {
    await this.findOne(id, ecoleId);

    return this.prisma.regleevaluation.update({
      where: { id },
      data: dto,
      include: {
        typeevaluation: true,
      },
    });
  }

  //Supprimer une règle d'évaluation
  async remove(id: string, ecoleId: string) {
    await this.findOne(id, ecoleId);

    return this.prisma.regleevaluation.delete({
      where: { id },
    });
  }
}
