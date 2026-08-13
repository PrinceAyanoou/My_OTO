import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  TraiterDemandeDto,
  UpdateEcoleStatutDto,
  UpdateUserStatutDto,
  QueryDemandeDto,
  QueryGlobalDto,
} from './dto/backoffice.dto';
import { Prisma } from 'src/generated/prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class BackofficeService {
  constructor(private readonly prisma: PrismaService) {}

  // Récupération de toutes les demandes des écoles (avec pagination et filtres)
  async findAllDemandes(query: QueryDemandeDto) {
    const { page = 1, limit = 10, statut, type } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.demandeecoleWhereInput = {};
    if (statut) where.statut = statut;
    if (type) where.type = type;

    const [total, data] = await Promise.all([
      this.prisma.demandeecole.count({ where }),
      this.prisma.demandeecole.findMany({
        where,
        skip,
        take: limit,
        include: {
          ecole: true,
          demandeur: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
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

  // Traitement d'une demande (Approbation ou Rejet)
  async traiterDemande(id: string, dto: TraiterDemandeDto) {
    const demande = await this.prisma.demandeecole.findUnique({
      where: { id },
      include: { ecole: true },
    });

    if (!demande) {
      throw new NotFoundException(`Demande avec l'ID '${id}' introuvable.`);
    }

    if (demande.statut !== 'EN_ATTENTE') {
      throw new BadRequestException('Cette demande a déjà été traitée.');
    }

    // Transaction Prisma pour garantir l'atomicité
    return this.prisma.$transaction(async (tx) => {
      // 1. Rejet de la demande
      if (dto.statut === 'REJETEE') {
        // Si l'école existait déjà et était en cours de modification/suppression, on la remet en ACTIF
        if (
          demande.ecoleId &&
          demande.ecole &&
          (demande.ecole.statut === 'TRAITEMENT_MODIFICATION' ||
            demande.ecole.statut === 'TRAITEMENT_SUPPRESSION')
        ) {
          await tx.ecole.update({
            where: { id: demande.ecoleId },
            data: { statut: 'ACTIF' },
          });
        }

        return tx.demandeecole.update({
          where: { id },
          data: {
            statut: 'REJETEE',
            commentaireAdmin: dto.commentaireAdmin,
          },
        });
      }

      // 2. Approbation de la demande
      let createdEcoleId: string | null = null;

      if (demande.type === 'CREATION') {
        // Validation des informations obligatoires proposées pour la création
        if (
          !demande.nomPropose ||
          !demande.typePropose ||
          !demande.nomFondateurPropose ||
          !demande.villePropose ||
          !demande.emailPropose ||
          !demande.telephonePropose
        ) {
          throw new BadRequestException(
            'Incomplet : des informations clés sur l’école proposée sont manquantes.',
          );
        }

        // Génération d'un code unique pour l'école
        const generatedCode = `ECO-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        // Insertion de l'école dans la BDD avec attribution du créateur (user clerkUserId)
        const newEcole = await tx.ecole.create({
          data: {
            nom: demande.nomPropose,
            type: demande.typePropose,
            nomFondateur: demande.nomFondateurPropose,
            ville: demande.villePropose,
            boitePostale: demande.boitePostalePropose,
            email: demande.emailPropose,
            telephone: demande.telephonePropose,
            description: demande.descriptionPropose,
            statut: 'ACTIF',
            code: generatedCode,
            valideAt: new Date(),
            createurId: demande.demandeurId,
          },
        });

        createdEcoleId = newEcole.id;
      } else if (demande.type === 'MODIFICATION') {
        if (!demande.ecoleId) {
          throw new BadRequestException(
            "L'ID de l'école est manquant pour effectuer la modification.",
          );
        }

        // Mise à jour de l'école existante avec les modifications proposées
        await tx.ecole.update({
          where: { id: demande.ecoleId },
          data: {
            nom: demande.nomPropose ?? undefined,
            type: demande.typePropose ?? undefined,
            nomFondateur: demande.nomFondateurPropose ?? undefined,
            ville: demande.villePropose ?? undefined,
            boitePostale: demande.boitePostalePropose ?? undefined,
            email: demande.emailPropose ?? undefined,
            telephone: demande.telephonePropose ?? undefined,
            description: demande.descriptionPropose ?? undefined,
            statut: 'ACTIF',
          },
        });
      } else if (demande.type === 'SUPPRESSION') {
        if (!demande.ecoleId) {
          throw new BadRequestException(
            "L'ID de l'école est manquant pour effectuer la suppression.",
          );
        }

        await tx.ecole.update({
          where: { id: demande.ecoleId },
          data: { statut: 'DESACTIVE' },
        });
      }

      // Mise à jour de la demande en APPROUVEE (et rattachement de l'ecoleId si création)
      return tx.demandeecole.update({
        where: { id },
        data: {
          statut: 'APPROUVEE',
          commentaireAdmin: dto.commentaireAdmin,
          ...(createdEcoleId && { ecoleId: createdEcoleId }),
        },
      });
    });
  }

  // Récupération globale de toutes les écoles
  async findAllEcoles(query: QueryGlobalDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ecoleWhereInput = search
      ? {
          OR: [
            { nom: { contains: search } },
            { code: { contains: search } },
            { email: { contains: search } },
            { ville: { contains: search } },
          ],
        }
      : {};

    const [total, data] = await Promise.all([
      this.prisma.ecole.count({ where }),
      this.prisma.ecole.findMany({
        where,
        skip,
        take: limit,
        include: { createur: true },
        orderBy: { createdAt: 'desc' },
      }),
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

  // Modification du statut d'une école (ex: Suspension/Activation)
  async updateEcoleStatut(ecoleId: string, dto: UpdateEcoleStatutDto) {
    const ecole = await this.prisma.ecole.findUnique({
      where: { id: ecoleId },
    });

    if (!ecole) {
      throw new NotFoundException(`École avec l'ID '${ecoleId}' introuvable.`);
    }

    return this.prisma.ecole.update({
      where: { id: ecoleId },
      data: { statut: dto.statut },
    });
  }

  // Récupération globale de tous les utilisateurs
  async findAllUsers(query: QueryGlobalDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.userWhereInput = search
      ? {
          OR: [
            { nom: { contains: search } },
            { prenoms: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {};

    const [total, data] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
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

  // Modification du statut d'un utilisateur
  async updateUserStatut(userId: string, dto: UpdateUserStatutDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(
        `Utilisateur avec l'ID '${userId}' introuvable.`,
      );
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { statut: dto.statut },
    });
  }
}
