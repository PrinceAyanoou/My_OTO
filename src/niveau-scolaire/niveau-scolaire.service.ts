import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateNiveauScolaireDto,
  UpdateNiveauScolaireDto,
  QueryNiveauScolaireDto,
} from './dto/niveau-scolaire.dto';

@Injectable()
export class NiveauScolaireService {
  constructor(private readonly prisma: PrismaService) {}

  //Créer un niveau scolaire lié à l'école cible.
  async create(ecoleId: string, dto: CreateNiveauScolaireDto) {
    // Vérification de l'unicité via @@unique([nom, ecoleId])
    const existing = await this.prisma.niveauscolaire.findUnique({
      where: {
        nom_ecoleId: {
          nom: dto.nom,
          ecoleId: ecoleId,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Le niveau scolaire "${dto.nom}" existe déjà pour cette école.`,
      );
    }

    return this.prisma.niveauscolaire.create({
      data: {
        nom: dto.nom,
        ecoleId,
      },
    });
  }

  //Récupérer tous les niveaux scolaires d'une école
  async findAllByEcole(ecoleId: string, query?: QueryNiveauScolaireDto) {
    const { search } = query || {};

    return this.prisma.niveauscolaire.findMany({
      where: {
        ecoleId,
        ...(search && {
          nom: { contains: search },
        }),
      },
      include: {
        classscolaire: {
          select: {
            id: true,
            nom: true,
            capacite: true,
          },
        },
        _count: {
          select: { classscolaire: true },
        },
      },
      orderBy: { nom: 'asc' },
    });
  }

  // Récupérer un niveau par ID et vérifier qu'il appartient à l'école
  async findOne(ecoleId: string, niveauscolaireId: string) {
    const niveau = await this.prisma.niveauscolaire.findFirst({
      where: { id: niveauscolaireId, ecoleId: ecoleId },
      include: {
        classscolaire: true,
      },
    });

    if (!niveau) {
      throw new NotFoundException(
        `Niveau scolaire introuvable pour cette école.`,
      );
    }

    return niveau;
  }

  //Mettre à jour un niveau scolaire
  async update(
    ecoleId: string,
    niveauscolaireId: string,
    dto: UpdateNiveauScolaireDto,
  ) {
    await this.findOne(ecoleId, niveauscolaireId);

    return this.prisma.niveauscolaire.update({
      where: { id: niveauscolaireId },
      data: dto,
    });
  }

  //Supprimer un niveau scolaire
  async remove(ecoleId: string, niveauscolaireId: string) {
    await this.findOne(ecoleId, niveauscolaireId);

    return this.prisma.niveauscolaire.delete({
      where: { id: niveauscolaireId },
    });
  }
}
