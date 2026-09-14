import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePolitiqueEvaluationDto,
  UpdatePolitiqueEvaluationDto,
} from './dto/politique-evaluation.dto';

@Injectable()
export class PolitiqueEvaluationService {
  constructor(private readonly prisma: PrismaService) {}

  // Créer une politique d'évaluation
  async create(dto: CreatePolitiqueEvaluationDto, ecoleId: string) {
    // Vérifier que l'année scolaire existe et appartient à l'école
    const annee = await this.prisma.anneescolaire.findFirst({
      where: { id: dto.anneeScolaireId, ecoleId },
    });

    if (!annee) {
      throw new NotFoundException(
        "L'année scolaire spécifiée est introuvable pour cette école.",
      );
    }

    // Vérifier si une classe spécifique est définie et appartient à l'école
    if (dto.classeScolaireId) {
      const classe = await this.prisma.classscolaire.findFirst({
        where: {
          id: dto.classeScolaireId,
          niveauscolaire: { ecoleId },
        },
      });

      if (!classe) {
        throw new NotFoundException(
          'La classe scolaire spécifiée est introuvable pour cette école.',
        );
      }

      // Vérifier si la classe n'a pas déjà une politique
      const existingClassePolitique =
        await this.prisma.politiqueevaluation.findFirst({
          where: { classeScolaireId: dto.classeScolaireId, ecoleId },
        });

      if (existingClassePolitique) {
        throw new ConflictException(
          'Une politique d’évaluation est déjà rattachée à cette classe.',
        );
      }
    }

    // Vérifier l'unicité du nom au sein de la même école
    const existingNom = await this.prisma.politiqueevaluation.findFirst({
      where: {
        nom: dto.nom,
        ecoleId,
      },
    });

    if (existingNom) {
      throw new ConflictException(
        'Une politique d’évaluation avec ce nom existe déjà dans cette école.',
      );
    }

    return this.prisma.politiqueevaluation.create({
      data: {
        nom: dto.nom,
        ecoleId,
        anneeScolaireId: dto.anneeScolaireId,
        classeScolaireId: dto.classeScolaireId ?? null,
        methodeCalcul: dto.methodeCalcul ?? 'MOYENNE_PONDEREE',
        methodeArrondi: dto.methodeArrondi ?? 'CENTIEME',
        afficherRang: dto.afficherRang ?? true,
        estActive: dto.estActive ?? true,
      },
      include: {
        regleevaluation: {
          include: {
            typeevaluation: true,
          },
        },
        classscolaire: true,
      },
    });
  }

  //Lister toutes les politiques d'évaluation d'une école
  async findAll(ecoleId: string, anneeScolaireId?: string) {
    return this.prisma.politiqueevaluation.findMany({
      where: {
        ecoleId,
        ...(anneeScolaireId ? { anneeScolaireId } : {}),
      },
      include: {
        classscolaire: true,
        regleevaluation: {
          include: {
            typeevaluation: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  //Récupérer une politique d'évaluation par son ID
  async findOne(id: string, ecoleId: string) {
    const politique = await this.prisma.politiqueevaluation.findFirst({
      where: { id, ecoleId },
      include: {
        classscolaire: true,
        regleevaluation: {
          include: {
            typeevaluation: true,
          },
        },
      },
    });

    if (!politique) {
      throw new NotFoundException(
        "La politique d'évaluation est introuvable pour cette école.",
      );
    }

    return politique;
  }

  //Mettre à jour une politique d'évaluation
  async update(id: string, dto: UpdatePolitiqueEvaluationDto, ecoleId: string) {
    await this.findOne(id, ecoleId);

    if (dto.nom) {
      const existingNom = await this.prisma.politiqueevaluation.findFirst({
        where: {
          nom: dto.nom,
          ecoleId,
          NOT: { id },
        },
      });

      if (existingNom) {
        throw new ConflictException(
          'Une autre politique porte déjà ce nom dans votre école.',
        );
      }
    }

    if (dto.classeScolaireId) {
      const existingClassePolitique =
        await this.prisma.politiqueevaluation.findFirst({
          where: {
            classeScolaireId: dto.classeScolaireId,
            ecoleId,
            NOT: { id },
          },
        });

      if (existingClassePolitique) {
        throw new ConflictException(
          'Une autre politique d’évaluation est déjà rattachée à cette classe.',
        );
      }
    }

    return this.prisma.politiqueevaluation.update({
      where: { id },
      data: dto,
      include: {
        classscolaire: true,
        regleevaluation: {
          include: {
            typeevaluation: true,
          },
        },
      },
    });
  }

  //Supprimer une politique d'évaluation
  async remove(id: string, ecoleId: string) {
    await this.findOne(id, ecoleId);

    return this.prisma.politiqueevaluation.delete({
      where: { id },
    });
  }
}
