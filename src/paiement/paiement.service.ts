import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreatePaiementDto, UpdatePaiementDto } from './dto/paiement.dto';

@Injectable()
export class PaiementService {
  constructor(private readonly prisma: PrismaService) {}

  //vérifie qu'un dossier scolaire existe et qu'il appartient bien à l'école.
  private async getDossierScolarite(
    ecoleId: string,
    dossierScolariteId: string,
  ) {
    const dossier = await this.prisma.dossierscolarite.findFirst({
      where: {
        id: dossierScolariteId,
        inscription: {
          anneescolaire: {
            ecoleId,
          },
        },
      },
      include: {
        inscription: {
          include: {
            apprenant: true,
            anneescolaire: true,
            classscolaire: true,
          },
        },
        configurationscolarite: true,
      },
    });

    if (!dossier) {
      throw new NotFoundException(
        "Le dossier scolaire est introuvable ou n'appartient pas à cette école.",
      );
    }

    return dossier;
  }

  //Récupère un paiement et vérifie qu'il appartient bien à l'école.
  private async getPaiement(ecoleId: string, paiementId: string) {
    const paiement = await this.prisma.paiement.findFirst({
      where: {
        id: paiementId,
        dossierscolarite: {
          inscription: {
            anneescolaire: {
              ecoleId,
            },
          },
        },
      },
      include: {
        dossierscolarite: {
          include: {
            inscription: {
              include: {
                apprenant: true,
                anneescolaire: true,
                classscolaire: true,
              },
            },
            configurationscolarite: true,
          },
        },
      },
    });

    if (!paiement) {
      throw new NotFoundException(
        "Le paiement est introuvable ou n'appartient pas à cette école.",
      );
    }

    return paiement;
  }

  //Créer un paiement / faire un paiement.
  async create(ecoleId: string, dto: CreatePaiementDto) {
    const dossier = await this.getDossierScolarite(
      ecoleId,
      dto.dossierScolariteId,
    );

    // un paiement ne peut pas être supérieur au montant qu'il reste à payer.
    if (dto.montant > dossier.resteAPayer) {
      throw new BadRequestException(
        `Le montant du paiement (${dto.montant}) ` +
          `ne peut pas dépasser le reste à payer (${dossier.resteAPayer}).`,
      );
    }

    // Nouveau reste à payer après paiement.
    const nouveauReste = dossier.resteAPayer - dto.montant;

    //si le nouveau reste à payer est 0 alors on passe le statut à SOLDEE.
    const nouveauStatut = nouveauReste === 0 ? 'SOLDEE' : dossier.statut;

    //On utilise une transaction pour creér un paiement et mettre à jour le dossier scolarité.
    return this.prisma.$transaction(async (tx) => {
      const paiement = await tx.paiement.create({
        data: {
          montant: dto.montant,
          datePaiement: dto.datePaiement,
          moyenPaiement: dto.moyenPaiement,
          references: dto.references,
          recuUrl: dto.recuUrl,
          dossierScolariteId: dto.dossierScolariteId,
        },
      });

      await tx.dossierscolarite.update({
        where: {
          id: dto.dossierScolariteId,
        },
        data: {
          resteAPayer: nouveauReste,
          statut: nouveauStatut,
        },
      });

      return paiement;
    });
  }

  //Récupérer tous les paiement appartenants à une école.
  async findAll(ecoleId: string) {
    return this.prisma.paiement.findMany({
      where: {
        dossierscolarite: {
          inscription: {
            anneescolaire: {
              ecoleId,
            },
          },
        },
      },
      include: {
        dossierscolarite: {
          include: {
            inscription: {
              include: {
                apprenant: true,
                anneescolaire: true,
                classscolaire: true,
              },
            },
            configurationscolarite: true,
          },
        },
      },
      orderBy: {
        datePaiement: 'desc',
      },
    });
  }

  //Récupérer  un paiement.
  async findOne(ecoleId: string, paiementId: string) {
    return this.getPaiement(ecoleId, paiementId);
  }

  //Modifier un paiement.

  async update(ecoleId: string, paiementId: string, dto: UpdatePaiementDto) {
    const paiement = await this.getPaiement(ecoleId, paiementId);

    //si le montant du paiment n'est pas modifié on modifie juste les autres informations.
    if (dto.montant === undefined) {
      return this.prisma.paiement.update({
        where: {
          id: paiementId,
        },
        data: {
          datePaiement: dto.datePaiement,
          moyenPaiement: dto.moyenPaiement,
          references: dto.references,
          recuUrl: dto.recuUrl,
        },
      });
    }

    //Si le montant est modifié alors on calcule la différence entre l'ancien montant et le nouveau puis on soustarit ou ajoute
    //cette différence au nouveauReste
    const difference = dto.montant - paiement.montant;

    const nouveauReste = paiement.dossierscolarite.resteAPayer - difference;

    // Le reste ne peut jamais devenir négatif.
    if (nouveauReste < 0) {
      throw new BadRequestException(
        'La modification du paiement dépasse le montant restant à payer.',
      );
    }

    const nouveauStatut =
      nouveauReste === 0 ? 'SOLDEE' : paiement.dossierscolarite.statut;

    return this.prisma.$transaction(async (tx) => {
      const paiementModifie = await tx.paiement.update({
        where: {
          id: paiementId,
        },
        data: {
          montant: dto.montant,
          datePaiement: dto.datePaiement,
          moyenPaiement: dto.moyenPaiement,
          references: dto.references,
          recuUrl: dto.recuUrl,
        },
      });

      await tx.dossierscolarite.update({
        where: {
          id: paiement.dossierScolariteId,
        },
        data: {
          resteAPayer: nouveauReste,
          statut: nouveauStatut,
        },
      });

      return paiementModifie;
    });
  }

  //Supprimer un paiement tout en modifiant les reste à payer.
  async remove(ecoleId: string, paiementId: string) {
    const paiement = await this.getPaiement(ecoleId, paiementId);

    const nouveauReste =
      paiement.dossierscolarite.resteAPayer + paiement.montant;

    const nouveauStatut = nouveauReste === 0 ? 'SOLDEE' : 'A_JOUR';

    return this.prisma.$transaction(async (tx) => {
      await tx.paiement.delete({
        where: {
          id: paiementId,
        },
      });

      await tx.dossierscolarite.update({
        where: {
          id: paiement.dossierScolariteId,
        },
        data: {
          resteAPayer: nouveauReste,
          statut: nouveauStatut,
        },
      });

      return {
        message: 'Le paiement a été supprimé avec succès.',
      };
    });
  }
}
