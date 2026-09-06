import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateInscriptionDto, ChangeClasseDto } from './dto/inscription.dto';

@Injectable()
export class InscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  //Changer la classe d'un apprenant en toute sécurité
  async changeClasse(
    apprenantId: string,
    anneeScolaireId: string,
    dto: ChangeClasseDto,
    ecoleId: string,
  ) {
    const inscription = await this.findOne(
      apprenantId,
      anneeScolaireId,
      ecoleId,
    );

    if (inscription.classeScolaireId === dto.nouvelleClasseId) {
      throw new BadRequestException(
        "L'apprenant est déjà inscrit dans cette classe.",
      );
    }

    // Vérifier l'existence et la capacité de la nouvelle classe
    const nouvelleClasse = await this.prisma.classscolaire.findFirst({
      where: {
        id: dto.nouvelleClasseId,
        niveauscolaire: { ecoleId: ecoleId },
      },
      include: {
        _count: { select: { inscription: true } },
      },
    });

    if (!nouvelleClasse) {
      throw new NotFoundException(
        "La classe de destination n'existe pas dans cette école.",
      );
    }

    if (
      nouvelleClasse.capacite &&
      nouvelleClasse._count.inscription >= nouvelleClasse.capacite
    ) {
      throw new BadRequestException(
        "La classe de destination a atteint sa capacité maximale d'accueil.",
      );
    }

    // Sécurité métier : Vérifier la présence de notes associées dans l'ancienne classe
    const totalNotes = await this.prisma.note.count({
      where: {
        inscriptionApprenantId: apprenantId,
        inscriptionAnneeId: anneeScolaireId,
      },
    });

    if (totalNotes > 0) {
      throw new BadRequestException(
        `Changement de classe refusé : ${totalNotes} note(s) ont déjà été enregistrées pour cet apprenant sur l'année en cours.`,
      );
    }

    return this.prisma.inscription.update({
      where: {
        apprenantId_anneeScolaireId: { apprenantId, anneeScolaireId },
      },
      data: {
        classeScolaireId: dto.nouvelleClasseId,
      },
      include: {
        apprenant: true,
        classscolaire: true,
        anneescolaire: true,
      },
    });
  }

  //Lister toutes les inscriptions de l'école (avec filtres optionnels)
  async findAllBySchool(
    ecoleId: string,
    anneeScolaireId?: string,
    classeScolaireId?: string,
  ) {
    return this.prisma.inscription.findMany({
      where: {
        anneescolaire: { ecoleId },
        ...(anneeScolaireId ? { anneeScolaireId } : {}),
        ...(classeScolaireId ? { classeScolaireId } : {}),
      },
      include: {
        apprenant: true,
        classscolaire: true,
        anneescolaire: true,
        dossierscolarite: true,
      },
      orderBy: { dateInscription: 'desc' },
    });
  }

  //Récupérer une inscription spécifique via sa clé composée
  async findOne(apprenantId: string, anneeScolaireId: string, ecoleId: string) {
    const inscription = await this.prisma.inscription.findFirst({
      where: {
        apprenantId,
        anneeScolaireId,
        anneescolaire: { ecoleId },
      },
      include: {
        apprenant: true,
        classscolaire: true,
        anneescolaire: true,
        configurationscolarite: { include: { tranchescolarite: true } },
        dossierscolarite: { include: { paiement: true } },
        decisionfinannee: true,
      },
    });

    if (!inscription) {
      throw new NotFoundException(
        `Inscription introuvable pour cet apprenant sur l'année scolaire spécifiée.`,
      );
    }

    return inscription;
  }

  // Historique complet de toutes les inscriptions d'un apprenant au fil des ans
  async findHistoryByApprenant(apprenantId: string, ecoleId: string) {
    return this.prisma.inscription.findMany({
      where: {
        apprenantId,
        anneescolaire: { ecoleId },
      },
      include: {
        anneescolaire: true,
        classscolaire: true,
        dossierscolarite: true,
        decisionfinannee: true,
      },
      orderBy: { dateInscription: 'desc' },
    });
  }

  //Mettre à jour les informations d'une inscription
  async update(
    apprenantId: string,
    anneeScolaireId: string,
    dto: UpdateInscriptionDto,
    ecoleId: string,
  ) {
    await this.findOne(apprenantId, anneeScolaireId, ecoleId);

    return this.prisma.inscription.update({
      where: {
        apprenantId_anneeScolaireId: {
          apprenantId,
          anneeScolaireId,
        },
      },
      data: {
        type: dto.type,
        classeScolaireId: dto.classeScolaireId,
        configuartionScolariteId: dto.configuartionScolariteId,
        matricule: dto.matricule,
        ...(dto.dateInscription
          ? { dateInscription: new Date(dto.dateInscription) }
          : {}),
      },
      include: {
        apprenant: true,
        classscolaire: true,
        dossierscolarite: true,
      },
    });
  }

  //Supprimer une inscription (et son dossier de scolarité via Cascade)
  async remove(apprenantId: string, anneeScolaireId: string, ecoleId: string) {
    await this.findOne(apprenantId, anneeScolaireId, ecoleId);

    return this.prisma.inscription.delete({
      where: {
        apprenantId_anneeScolaireId: {
          apprenantId,
          anneeScolaireId,
        },
      },
    });
  }
}
