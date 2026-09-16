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

  //  Créer une classe scolaire
  async create(niveauscolaireId: string, dto: CreateClasseScolaireDto) {
    const niveauExists = await this.prisma.niveauscolaire.findUnique({
      where: { id: niveauscolaireId },
    });

    if (!niveauExists) {
      throw new NotFoundException(`Niveau scolaire introuvable.`);
    }

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
      include: {
        niveauscolaire: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
    });
  }

  //  Lister les classes d'un niveau scolaire
  async findAllByNiveau(
    niveauscolaireId: string,
    query?: QueryClasseScolaireDto,
  ) {
    const page = Math.max(1, Number(query) || 1);
    const limit = Math.max(1, Number(query) || 10);
    const skip = (page - 1) * limit;

    const niveauExists = await this.prisma.niveauscolaire.findUnique({
      where: { id: niveauscolaireId },
    });

    if (!niveauExists) {
      throw new NotFoundException(`Niveau scolaire introuvable.`);
    }

    const search = query?.search?.trim();

    const where = {
      niveauScolaireId: niveauscolaireId,
      ...(search && {
        nom: { contains: search },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.classscolaire.findMany({
        where,
        skip,
        take: limit,
        include: {
          niveauscolaire: {
            select: {
              id: true,
              nom: true,
            },
          },
        },
        orderBy: { nom: 'asc' },
      }),
      this.prisma.classscolaire.count({ where }),
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

  // Récupérer une classe spécifique
  async findOne(niveauscolaireId: string, classeScolaireId: string) {
    const classe = await this.prisma.classscolaire.findFirst({
      where: {
        id: classeScolaireId,
        niveauScolaireId: niveauscolaireId,
      },
      include: {
        niveauscolaire: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
    });

    if (!classe) {
      throw new NotFoundException(
        `Classe scolaire introuvable pour ce niveau.`,
      );
    }

    return classe;
  }

  // Lister toutes les classes d'une école
  async findAllByEcole(ecoleId: string, query?: QueryClasseScolaireDto) {
    const page = Math.max(1, Number(query) || 1);
    const limit = Math.max(1, Number(query) || 10);
    const skip = (page - 1) * limit;

    const existEcole = await this.prisma.ecole.findUnique({
      where: { id: ecoleId },
    });

    if (!existEcole) {
      throw new NotFoundException(`Cette école n'existe pas.`);
    }

    const search = query?.search?.trim();

    const where = {
      niveauscolaire: {
        ecoleId,
      },
      ...(search && {
        nom: { contains: search },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.classscolaire.findMany({
        where,
        skip,
        take: limit,
        include: {
          niveauscolaire: {
            select: {
              id: true,
              nom: true,
            },
          },
        },
        orderBy: [{ niveauscolaire: { nom: 'asc' } }, { nom: 'asc' }],
      }),
      this.prisma.classscolaire.count({ where }),
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

  //  Mettre à jour une classe scolaire
  async update(
    niveauscolaireId: string,
    classeScolaireId: string,
    dto: UpdateClasseScolaireDto,
  ) {
    const currentClasse = await this.findOne(
      niveauscolaireId,
      classeScolaireId,
    );

    if (dto.nom && dto.nom !== currentClasse.nom) {
      const existing = await this.prisma.classscolaire.findFirst({
        where: {
          nom: dto.nom,
          niveauScolaireId: niveauscolaireId,
        },
      });

      if (existing && existing.id !== classeScolaireId) {
        throw new ConflictException(
          `La classe "${dto.nom}" existe déjà pour ce niveau scolaire.`,
        );
      }
    }

    return this.prisma.classscolaire.update({
      where: { id: currentClasse.id },
      data: {
        ...(dto.nom && { nom: dto.nom }),
        ...(dto.capacite !== undefined && { capacite: dto.capacite }),
      },
      include: {
        niveauscolaire: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
    });
  }

  //  Supprimer une classe scolaire
  async remove(niveauscolaireId: string, classeScolaireId: string) {
    const currentClasse = await this.findOne(
      niveauscolaireId,
      classeScolaireId,
    );

    return this.prisma.classscolaire.delete({
      where: { id: currentClasse.id },
    });
  }
}
