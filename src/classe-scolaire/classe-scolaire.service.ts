import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateClasseScolaireDto,
  UpdateClasseScolaireDto,
  QueryClasseScolaireDto,
} from './dto/classe-scolaire.dto';

@Injectable()
export class ClasseScolaireService {
  constructor(private readonly prisma: PrismaService) {}

  // Créer une classe liée à un niveau scolaire
  async create(niveauscolaireId: string, dto: CreateClasseScolaireDto) {
    // Vérification de l'existence du niveau scolaire
    const niveauExists = await this.prisma.niveauscolaire.findUnique({
      where: { id: niveauscolaireId },
    });

    if (!niveauExists) {
      throw new NotFoundException(`Niveau scolaire introuvable.`);
    }

    // Vérification de l'unicité du nom de classe au sein du même niveau
    const existing = await this.prisma.classscolaire.findFirst({
      where: {
        nom: dto.nom,
        niveauScolaireId: niveauscolaireId,
      },
    });

    if (existing) {
      throw new ConflictException(
        `La classe "${dto.nom}" existe déjà pour ce niveau scolaire.`,
      );
    }

    return this.prisma.classscolaire.create({
      data: {
        nom: dto.nom,
        capacite: dto.capacite,
        niveauScolaireId: niveauscolaireId,
      },
    });
  }

  //Récupérer toutes les classes associées à un niveau scolaire
  async findAllByNiveau(
    niveauscolaireId: string,
    query?: QueryClasseScolaireDto,
  ) {
    const { search } = query || {};

    return this.prisma.classscolaire.findMany({
      where: {
        niveauScolaireId: niveauscolaireId,
        ...(search && {
          nom: { contains: search },
        }),
      },
      include: {
        niveauscolaire: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
      orderBy: { nom: 'asc' },
    });
  }

  // Récupérer une classe par son ID et vérifier qu'elle appartient bien au niveau scolaire
  async findOne(niveauscolaireId: string, classeScolaireId: string) {
    const classe = await this.prisma.classscolaire.findFirst({
      where: { id: classeScolaireId, niveauScolaireId: niveauscolaireId },
      include: {
        niveauscolaire: true,
      },
    });

    if (!classe) {
      throw new NotFoundException(
        `Classe scolaire introuvable pour ce niveau.`,
      );
    }

    return classe;
  }

  // Récupérer toutes les classes scolaires d'une école (tous niveaux confondus)
  async findAllByEcole(ecoleId: string, query?: QueryClasseScolaireDto) {
    const { search } = query || {};

    const existEcole = await this.prisma.ecole.findUnique({
      where: { id: ecoleId },
    });

    if (!existEcole) {
      throw new NotFoundException(`Cette école n'existe pas`);
    }
    const classeScolaire = await this.prisma.classscolaire.findMany({
      where: {
        niveauscolaire: {
          ecoleId,
        },
        ...(search && {
          nom: { contains: search },
        }),
      },
      include: {
        niveauscolaire: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
      orderBy: [{ niveauscolaire: { nom: 'asc' } }, { nom: 'asc' }],
    });

    if (classeScolaire.length > 0) {
      return classeScolaire;
    }
    throw new NotFoundException(
      `Cette école ne possède pas encore de classe scolaire`,
    );
  }

  //
  //Mettre à jour une classe scolaire
  async update(
    niveauscolaireId: string,
    classeScolaireId: string,
    dto: UpdateClasseScolaireDto,
  ) {
    await this.findOne(niveauscolaireId, classeScolaireId);

    return this.prisma.classscolaire.update({
      where: { id: classeScolaireId },
      data: dto,
    });
  }

  //
  //Supprimer une classe scolaire
  async remove(niveauscolaireId: string, classeScolaireId: string) {
    await this.findOne(niveauscolaireId, classeScolaireId);

    return this.prisma.classscolaire.delete({
      where: { id: classeScolaireId },
    });
  }
}
