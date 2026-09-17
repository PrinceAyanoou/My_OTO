import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { dossierscolarite_statut } from 'src/generated/prisma/enums';
import {
  CreateDossierScolariteDto,
  UpdateDossierScolariteDto,
} from './dto/dossier-scolarite.dto';

@Injectable()
export class DossierScolariteService {
  constructor(private readonly prisma: PrismaService) {}

  //  Créer un dossier de scolarité
  async create(dto: CreateDossierScolariteDto) {
    const existing = await this.prisma.dossierscolarite.findUnique({
      where: {
        inscriptionApprenantId_inscriptionAnneeId: {
          inscriptionApprenantId: dto.inscriptionApprenantId,
          inscriptionAnneeId: dto.inscriptionAnneeId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Un dossier existe déjà pour cette inscription.',
      );
    }

    return this.prisma.dossierscolarite.create({
      data: dto,
      include: {
        configurationscolarite: true,
        paiement: true,
      },
    });
  }

  // Récupérer un dossier par clé composée (apprenantId, anneeId)
  async findOne(inscriptionApprenantId: string, inscriptionAnneeId: string) {
    const dossier = await this.prisma.dossierscolarite.findUnique({
      where: {
        inscriptionApprenantId_inscriptionAnneeId: {
          inscriptionApprenantId,
          inscriptionAnneeId,
        },
      },
      include: {
        configurationscolarite: {
          include: {
            tranchescolarite: true,
          },
        },
        paiement: {
          orderBy: { datePaiement: 'desc' },
        },
        inscription: {
          include: {
            apprenant: true,
            classscolaire: true,
          },
        },
      },
    });

    if (!dossier) {
      throw new NotFoundException('Dossier de scolarité introuvable.');
    }

    return dossier;
  }

  // Récupérer les dossiers d'une année scolaire
  async findByAnnee(anneeScolaireId: string) {
    return this.prisma.dossierscolarite.findMany({
      where: { inscriptionAnneeId: anneeScolaireId },
      include: {
        inscription: {
          include: {
            apprenant: true,
            classscolaire: true,
          },
        },
        paiement: true,
      },
    });
  }

  // Mettre à jour manuellement un dossier
  async update(
    inscriptionApprenantId: string,
    inscriptionAnneeId: string,
    dto: UpdateDossierScolariteDto,
  ) {
    await this.findOne(inscriptionApprenantId, inscriptionAnneeId);

    return this.prisma.dossierscolarite.update({
      where: {
        inscriptionApprenantId_inscriptionAnneeId: {
          inscriptionApprenantId,
          inscriptionAnneeId,
        },
      },
      data: dto,
    });
  }

  // Recalculer automatiquement le reste à payer et le statut après un paiement
  async recalculerSolde(
    inscriptionApprenantId: string,
    inscriptionAnneeId: string,
  ) {
    const dossier = await this.findOne(
      inscriptionApprenantId,
      inscriptionAnneeId,
    );

    const totalPaye = dossier.paiement.reduce((sum, p) => sum + p.montant, 0);

    const resteAPayer = Math.max(0, dossier.montant - totalPaye);

    let statut: dossierscolarite_statut = dossierscolarite_statut.A_JOUR;
    if (resteAPayer === 0) {
      statut = dossierscolarite_statut.SOLDEE;
    }

    return this.prisma.dossierscolarite.update({
      where: {
        inscriptionApprenantId_inscriptionAnneeId: {
          inscriptionApprenantId,
          inscriptionAnneeId,
        },
      },
      data: {
        resteAPayer,
        statut,
      },
    });
  }
}
