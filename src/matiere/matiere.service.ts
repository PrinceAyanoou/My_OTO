import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMatiereDto,
  UpdateMatiereDto,
  QueryMatiereDto,
} from './dto/matiere.dto';

@Injectable()
export class MatiereService {
  constructor(private readonly prisma: PrismaService) {}

  //Créer une matière rattachée à une école
  async create(ecoleId: string, dto: CreateMatiereDto) {
    // Vérification de l'existence de l'école
    const ecole = await this.prisma.ecole.findUnique({
      where: { id: ecoleId },
    });

    if (!ecole) {
      throw new NotFoundException(`École introuvable.`);
    }

    // Vérification de l'unicité du nom au sein de la même école (contrainte @@unique([nom, ecoleId]))
    const existing = await this.prisma.matiere.findUnique({
      where: {
        nom_ecoleId: {
          nom: dto.nom,
          ecoleId: ecoleId,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Une matière nommée "${dto.nom}" existe déjà dans cette école.`,
      );
    }

    return this.prisma.matiere.create({
      data: {
        ...dto,
        ecoleId,
      },
    });
  }

  // Récupérer toutes les matières d'une école
  async findAllByEcole(ecoleId: string, query?: QueryMatiereDto) {
    const { search } = query || {};

    const existEcole = await this.prisma.ecole.findUnique({
      where: { id: ecoleId },
    });

    if (!existEcole) {
      throw new NotFoundException(`Cette école n'existe pas.`);
    }

    const matiere = await this.prisma.matiere.findMany({
      where: {
        ecoleId,
        ...(search && {
          OR: [
            { nom: { contains: search } },
            { CodeMat: { contains: search } },
          ],
        }),
      },
      orderBy: { nom: 'asc' },
    });

    if (matiere.length > 0) {
      return matiere;
    }
    throw new NotFoundException(`Cette école ne dispose pas de matière`);
  }

  //Récupérer une matière par son ID et s'assurer qu'elle appartient à la bonne école
  async findOne(ecoleId: string, matiereId: string) {
    const matiere = await this.prisma.matiere.findFirst({
      where: { id: matiereId, ecoleId: ecoleId },
      include: {
        classematirere: {
          include: {
            classscolaire: {
              select: { id: true, nom: true },
            },
          },
        },
      },
    });

    if (!matiere) {
      throw new NotFoundException(`Matière introuvable pour cette école.`);
    }

    return matiere;
  }

  //Mettre à jour une matière
  async update(ecoleId: string, matiereId: string, dto: UpdateMatiereDto) {
    await this.findOne(ecoleId, matiereId);

    // Si le nom est mis à jour, vérifier le conflit d'unicité
    if (dto.nom) {
      const existing = await this.prisma.matiere.findFirst({
        where: {
          nom: dto.nom,
          ecoleId: ecoleId,
          NOT: { id: matiereId },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Une matière nommée "${dto.nom}" existe déjà dans cette école.`,
        );
      }
    }

    return this.prisma.matiere.update({
      where: { id: matiereId },
      data: dto,
    });
  }

  //Supprimer une matière
  async remove(ecoleId: string, matiereId: string) {
    await this.findOne(ecoleId, matiereId);

    return this.prisma.matiere.delete({
      where: { id: matiereId },
    });
  }
}
