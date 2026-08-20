import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateConfigurationScolariteDto,
  UpdateConfigurationScolariteDto,
  ConfigurationScolariteQueryDto,
} from './dto/configuration-scolarite.dto';

@Injectable()
export class ConfigurationScolariteService {
  constructor(private readonly prisma: PrismaService) {}

  private async validateRelations(
    ecoleId: string,
    dto: {
      niveauScolaireId?: string;
      anneeScolaireId?: string;
    },
  ) {
    if (dto.niveauScolaireId) {
      const niveau = await this.prisma.niveauscolaire.findFirst({
        where: {
          id: dto.niveauScolaireId,
          ecoleId,
        },
      });
      if (!niveau) {
        throw new BadRequestException(
          "Le niveau scolaire spécifié est introuvable ou n'appartient pas à cette école.",
        );
      }
    }

    if (dto.anneeScolaireId) {
      const annee = await this.prisma.anneescolaire.findFirst({
        where: {
          id: dto.anneeScolaireId,
          ecoleId,
        },
      });
      if (!annee) {
        throw new BadRequestException(
          "L'année scolaire spécifiée est introuvable ou n'appartient pas à cette école.",
        );
      }
    }
  }

  //créer une configuration de scolarité dans une école.
  async create(ecoleId: string, dto: CreateConfigurationScolariteDto) {
    //vérifie que les id fournis existent et appartiennent bien à cette école.
    await this.validateRelations(ecoleId, dto);

    const existingConfig = await this.prisma.configurationscolarite.findUnique({
      where: {
        niveauScolaireId_anneeScolaireId: {
          niveauScolaireId: dto.niveauScolaireId,
          anneeScolaireId: dto.anneeScolaireId,
        },
      },
    });

    if (existingConfig) {
      throw new ConflictException(
        'Une configuration de scolarité existe déjà pour ce niveau et cette année scolaire.',
      );
    }

    return this.prisma.configurationscolarite.create({
      data: {
        nom: dto.nom,
        estActive: dto.estActive ?? true,
        ecoleId: ecoleId,
        niveauScolaireId: dto.niveauScolaireId,
        anneeScolaireId: dto.anneeScolaireId,
      },
      include: {
        niveauscolaire: true,
        anneescolaire: true,
        tranchescolarite: true,
      },
    });
  }

  //Lister toutes les configuartion de scolarité pour une école.
  async findAll(ecoleId: string, query: ConfigurationScolariteQueryDto) {
    const existEcole = await this.prisma.ecole.findUnique({
      where: { id: ecoleId },
    });

    if (!existEcole) {
      throw new NotFoundException(`Cette école n'existe pas.`);
    }

    const { niveauScolaireId, anneeScolaireId, estActive, page, limit } = query;
    const skip = (page - 1) * limit;

    const where = {
      ecoleId,
      ...(niveauScolaireId && { niveauScolaireId }),
      ...(anneeScolaireId && { anneeScolaireId }),
      ...(estActive !== undefined && { estActive }),
    };

    const [data, total] = await Promise.all([
      this.prisma.configurationscolarite.findMany({
        where,
        skip,
        take: limit,
        include: {
          niveauscolaire: true,
          anneescolaire: true,
          tranchescolarite: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.configurationscolarite.count({ where }),
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

  //Trouver une configuartion de scolarité par son id dans une école.
  async findOne(ecoleId: string, id: string) {
    const existEcole = await this.prisma.ecole.findUnique({
      where: { id: ecoleId },
    });

    if (!existEcole) {
      throw new NotFoundException(`Cette école n'existe pas.`);
    }

    const config = await this.prisma.configurationscolarite.findFirst({
      where: {
        id,
        ecoleId,
      },
      include: {
        niveauscolaire: true,
        anneescolaire: true,
        tranchescolarite: {
          orderBy: { ordre: 'asc' },
        },
      },
    });

    if (!config) {
      throw new NotFoundException(
        `Configuration de scolarité introuvable pour cette école.`,
      );
    }

    return config;
  }

  //Mettre à jour une configuartion de scolarité dans une école.
  async update(
    ecoleId: string,
    id: string,
    dto: UpdateConfigurationScolariteDto,
  ) {
    const current = await this.findOne(ecoleId, id);

    const targetNiveauId = dto.niveauScolaireId ?? current.niveauScolaireId;
    const targetAnneeId = dto.anneeScolaireId ?? current.anneeScolaireId;

    if (dto.niveauScolaireId || dto.anneeScolaireId) {
      await this.validateRelations(ecoleId, {
        niveauScolaireId: targetNiveauId,
        anneeScolaireId: targetAnneeId,
      });
    }

    if (
      (dto.niveauScolaireId || dto.anneeScolaireId) &&
      (targetNiveauId !== current.niveauScolaireId ||
        targetAnneeId !== current.anneeScolaireId)
    ) {
      const duplicate = await this.prisma.configurationscolarite.findUnique({
        where: {
          niveauScolaireId_anneeScolaireId: {
            niveauScolaireId: targetNiveauId,
            anneeScolaireId: targetAnneeId,
          },
        },
      });

      if (duplicate && duplicate.id !== id) {
        throw new ConflictException(
          'Une configuration de scolarité existe déjà pour ce niveau et cette année scolaire.',
        );
      }
    }

    return this.prisma.configurationscolarite.update({
      where: { id: id },
      data: dto,
      include: {
        niveauscolaire: true,
        anneescolaire: true,
        tranchescolarite: true,
      },
    });
  }

  //supprimer une configuartion de scolarité dans une école.
  async remove(ecoleId: string, id: string) {
    await this.findOne(ecoleId, id);

    return this.prisma.configurationscolarite.delete({
      where: { id: id },
    });
  }
}
