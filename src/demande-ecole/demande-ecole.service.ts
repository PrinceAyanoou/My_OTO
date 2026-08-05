import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adaptez le chemin
import {
  DemanderCreationDto,
  DemanderModificationDto,
  DemanderSuppressionDto,
} from './dto/demande-ecole.dto';

@Injectable()
export class DemandeEcoleService {
  constructor(private readonly prisma: PrismaService) {}

  //service pour la demande de création d'une école.
  async demanderCreation(clerkUserId: string, dto: DemanderCreationDto) {
    //vérifie d'abord si le user qui fait la demande est déjà un user du système.
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId: clerkUserId },
    });
    if (!user) throw new NotFoundException("Veuillez vous inscrire d'abord ");

    //enrégistrement de la demande d'inscription.
    return this.prisma.demandeecole.create({
      data: {
        demandeurId: clerkUserId,
        type: 'CREATION',
        nomPropose: dto.nom,
        typePropose: dto.type,
        nomFondateurPropose: dto.nomFondateur,
        villePropose: dto.ville,
        boitePostalePropose: dto.boitePostale,
        emailPropose: dto.email,
        telephonePropose: dto.telephone,
        descriptionPropose: dto.description,
      },
    });
  }

  //service pour la demande de modification de l'école.
  async demanderModification(
    clerkUserId: string,
    dto: DemanderModificationDto,
  ) {
    const ecole = await this.prisma.ecole.findUnique({
      where: { id: dto.ecoleId },
    });
    if (!ecole) throw new NotFoundException('École introuvable.');

    const user = await this.prisma.user.findUnique({
      where: { clerkUserId: clerkUserId },
    });

    //on véifie si le user qui fait la demande est inscrit et si c'est le createur de l'école
    //car seul ce dernier peut faire des modifications.
    if (!user || ecole.createurId !== user.clerkUserId) {
      throw new ForbiddenException(
        'Seul le créateur de cette école peut effectuer cette demande.',
      );
    }
    //on vérifie s'il y a déjà une demande de modifications pour cette école.
    const demandeExistante = await this.prisma.demandeecole.findFirst({
      where: { ecoleId: dto.ecoleId, statut: 'EN_ATTENTE' },
    });

    return this.prisma.$transaction(async (tx) => {
      // Met à jour le statut opérationnel de l'école
      await tx.ecole.update({
        where: { id: dto.ecoleId },
        data: { statut: 'TRAITEMENT_MODIFICATION' },
      });

      // S'il existe déjà une demande de modification en cours -> ÉCRASEMENT/FUSION
      if (demandeExistante) {
        if (demandeExistante.type !== 'MODIFICATION') {
          throw new BadRequestException(
            `Une demande de type ${demandeExistante.type} est déjà en cours.`,
          );
        }

        return tx.demandeecole.update({
          where: { id: demandeExistante.id },
          data: {
            nomPropose: dto.donnees.nom ?? demandeExistante.nomPropose,
            typePropose: dto.donnees.type ?? demandeExistante.typePropose,
            nomFondateurPropose:
              dto.donnees.nomFondateur ?? demandeExistante.nomFondateurPropose,
            villePropose: dto.donnees.ville ?? demandeExistante.villePropose,
            boitePostalePropose:
              dto.donnees.boitePostale ?? demandeExistante.boitePostalePropose,
            emailPropose: dto.donnees.email ?? demandeExistante.emailPropose,
            telephonePropose:
              dto.donnees.telephone ?? demandeExistante.telephonePropose,
            descriptionPropose:
              dto.donnees.description ?? demandeExistante.descriptionPropose,
            motif: dto.motif ?? demandeExistante.motif,
            updatedAt: new Date(),
          },
        });
      }

      // Première demande de modification
      return tx.demandeecole.create({
        data: {
          ecoleId: dto.ecoleId,
          demandeurId: clerkUserId,
          type: 'MODIFICATION',
          nomPropose: dto.donnees.nom,
          typePropose: dto.donnees.type,
          nomFondateurPropose: dto.donnees.nomFondateur,
          villePropose: dto.donnees.ville,
          boitePostalePropose: dto.donnees.boitePostale,
          emailPropose: dto.donnees.email,
          telephonePropose: dto.donnees.telephone,
          descriptionPropose: dto.donnees.description,
          motif: dto.motif,
        },
      });
    });
  }

  //service de demande de suppression d'une école.
  async demanderSuppression(clerkUserId: string, dto: DemanderSuppressionDto) {
    const ecole = await this.prisma.ecole.findUnique({
      where: { id: dto.ecoleId },
    });
    if (!ecole) throw new NotFoundException('École introuvable.');

    const user = await this.prisma.user.findUnique({
      where: { clerkUserId: clerkUserId },
    });

    //vérifie si c'est bien le créateur qui fait la demande
    if (!user || ecole.createurId !== user.clerkUserId) {
      throw new ForbiddenException(
        'Seul le créateur de cette école peut demander sa suppression.',
      );
    }

    const demandeEnCours = await this.prisma.demandeecole.findFirst({
      where: { ecoleId: dto.ecoleId, statut: 'EN_ATTENTE' },
    });

    if (demandeEnCours) {
      throw new BadRequestException(
        'Une demande est déjà en cours pour cette école.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Passer le statut de l'école à TRAITEMENT_SUPPRESSION
      await tx.ecole.update({
        where: { id: dto.ecoleId },
        data: { statut: 'TRAITEMENT_SUPPRESSION' },
      });

      return tx.demandeecole.create({
        data: {
          ecoleId: dto.ecoleId,
          demandeurId: clerkUserId,
          type: 'SUPPRESSION',
          motif: dto.motif,
        },
      });
    });
  }

  //service pour lire les demande de son école en tant que créateur.
  async findDemandesByEcole(ecoleId: string, clerkUserId: string) {
    // Vérifier l'existence de l'école
    const ecole = await this.prisma.ecole.findUnique({
      where: { id: ecoleId },
    });

    if (!ecole) {
      throw new NotFoundException('École introuvable.');
    }

    // Vérifier si l'utilisateur est le créateur
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId: clerkUserId },
    });

    if (!user || ecole.createurId !== user.clerkUserId) {
      throw new ForbiddenException(
        "Seul le créateur de cette école est autorisé à consulter l'historique de ses demandes.",
      );
    }

    // Récupérer l'ensemble des demandes associées à cette école
    return this.prisma.demandeecole.findMany({
      where: { ecoleId },
      include: {
        demandeur: {
          select: { id: true, nom: true, prenoms: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
