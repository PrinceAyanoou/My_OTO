import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import {
  CreateTrancheScolariteDto,
  UpdateTrancheScolariteDto,
} from './dto/tranche-scolarite.dto';

@Injectable()
export class TrancheScolariteService {
  constructor(private readonly prisma: PrismaService) {}

  //Vérifie que l'école existe.
  private async validateEcole(ecoleId: string) {
    const ecole = await this.prisma.ecole.findUnique({
      where: {
        id: ecoleId,
      },
    });

    if (!ecole) {
      throw new NotFoundException("L'école indiquée est introuvable.");
    }

    return ecole;
  }

  /**
   * Vérifie que la configuration existe
   * ET qu'elle appartient bien à l'école indiquée.
   */
  private async validateConfiguration(
    ecoleId: string,
    configurationScolariteId: string,
  ) {
    const configuration = await this.prisma.configurationscolarite.findFirst({
      where: {
        id: configurationScolariteId,
        ecoleId,
      },
    });

    if (!configuration) {
      throw new NotFoundException(
        "La configuration de scolarité est introuvable ou n'appartient pas à cette école.",
      );
    }

    return configuration;
  }

  /**
   * Vérifie qu'une tranche avec le même ordre
   * n'existe pas déjà dans la configuration.
   */
  private async validateOrdre(
    configurationScolariteId: string,
    ordre: number,
    trancheId?: string,
  ) {
    const existingTranche = await this.prisma.tranchescolarite.findFirst({
      where: {
        configurationScolariteId,
        ordre,
        ...(trancheId && {
          NOT: {
            id: trancheId,
          },
        }),
      },
    });

    if (existingTranche) {
      throw new ConflictException(
        `Une tranche avec l'ordre ${ordre} existe déjà dans cette configuration de scolarité.`,
      );
    }
  }

  //Créer une tranche de scolarité.
  async create(
    ecoleId: string,
    configurationScolariteId: string,
    dto: CreateTrancheScolariteDto,
  ) {
    // Vérifier que l'école existe
    await this.validateEcole(ecoleId);

    // Vérifier que la configuration existe
    //    ET appartient à cette école
    await this.validateConfiguration(ecoleId, configurationScolariteId);

    // Vérifier que l'ordre n'existe pas déjà
    await this.validateOrdre(configurationScolariteId, dto.ordre);

    //  Créer la tranche
    return this.prisma.tranchescolarite.create({
      data: {
        nom: dto.nom,
        montant: dto.montant,
        dateEcheance: dto.dateEcheance,
        ordre: dto.ordre,

        configurationScolariteId,
      },

      include: {
        configurationscolarite: {
          include: {
            niveauscolaire: true,
            anneescolaire: true,
          },
        },
      },
    });
  }

  /**
   * Récupérer toutes les tranches
   * d'une configuration d'une école.
   */
  async findAll(ecoleId: string, configurationScolariteId: string) {
    // Vérifier école + configuration
    await this.validateEcole(ecoleId);

    await this.validateConfiguration(ecoleId, configurationScolariteId);

    return this.prisma.tranchescolarite.findMany({
      where: {
        configurationScolariteId,
      },

      orderBy: {
        ordre: 'asc',
      },
    });
  }

  //Récupérer une tranche précise.
  async findOne(ecoleId: string, configurationScolariteId: string, id: string) {
    // Vérifier école + configuration
    await this.validateEcole(ecoleId);

    await this.validateConfiguration(ecoleId, configurationScolariteId);

    // Chercher la tranche dans CETTE configuration
    const tranche = await this.prisma.tranchescolarite.findFirst({
      where: {
        id,
        configurationScolariteId,
      },

      include: {
        configurationscolarite: {
          include: {
            niveauscolaire: true,
            anneescolaire: true,
          },
        },
      },
    });

    if (!tranche) {
      throw new NotFoundException(
        'La tranche de scolarité est introuvable dans cette configuration.',
      );
    }

    return tranche;
  }

  //Modifier une tranche.
  async update(
    ecoleId: string,
    configurationScolariteId: string,
    id: string,
    dto: UpdateTrancheScolariteDto,
  ) {
    // Récupérer la tranche
    const current = await this.findOne(ecoleId, configurationScolariteId, id);

    // L'ordre final
    const targetOrdre = dto.ordre ?? current.ordre;

    //Vérifier le nouvel ordre
    await this.validateOrdre(configurationScolariteId, targetOrdre, id);

    // Modifier
    return this.prisma.tranchescolarite.update({
      where: {
        id,
      },

      data: {
        ...(dto.nom !== undefined && {
          nom: dto.nom,
        }),

        ...(dto.montant !== undefined && {
          montant: dto.montant,
        }),

        ...(dto.dateEcheance !== undefined && {
          dateEcheance: dto.dateEcheance,
        }),

        ...(dto.ordre !== undefined && {
          ordre: dto.ordre,
        }),
      },

      include: {
        configurationscolarite: {
          include: {
            niveauscolaire: true,
            anneescolaire: true,
          },
        },
      },
    });
  }

  //Supprimer une tranche.
  async remove(ecoleId: string, configurationScolariteId: string, id: string) {
    // Vérifie que la tranche appartient bien
    // à la configuration de cette école
    await this.findOne(ecoleId, configurationScolariteId, id);

    await this.prisma.tranchescolarite.delete({
      where: {
        id,
      },
    });

    return {
      message: 'La tranche de scolarité a été supprimée avec succès.',
    };
  }
}
