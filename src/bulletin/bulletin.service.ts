import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
  CreateBulletinDto,
  GenerateBulletinPdfDto,
  UpdateBulletinDto,
} from './dto/bulletin.dto';

export interface ResultatBulletinEleve {
  apprenantId: string;
  success: boolean;
  documentUrl?: string;
  error?: string;
}

export interface ResultatBulletinsClasse {
  classeScolaireId: string;
  total: number;
  generes: number;
  echecs: number;
  resultats: ResultatBulletinEleve[];
}

@Injectable()
export class BulletinService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // CRÉER UN BULLETIN
  async create(dto: CreateBulletinDto) {
    const {
      inscriptionApprenantId,
      inscriptionAnneeId,
      periodeScolaireId,
      appreciation,
      decisionFinAnnee,
    } = dto;

    //  Vérifier si l'inscription existe
    const inscription = await this.prisma.inscription.findUnique({
      where: {
        apprenantId_anneeScolaireId: {
          apprenantId: inscriptionApprenantId,
          anneeScolaireId: inscriptionAnneeId,
        },
      },
    });

    if (!inscription) {
      throw new NotFoundException(
        'Inscription introuvable pour cet apprenant et cette année scolaire.',
      );
    }

    // Vérifier si la période scolaire existe
    const periode = await this.prisma.periodescolaire.findUnique({
      where: { id: periodeScolaireId },
    });

    if (!periode) {
      throw new NotFoundException('Période scolaire introuvable.');
    }

    // Vérifier si le bulletin existe déjà pour cet apprenant et cette période
    const bulletinExistant = await this.prisma.bulletin.findUnique({
      where: {
        inscriptionApprenantId_inscriptionAnneeId_periodeScolaireId: {
          inscriptionApprenantId,
          inscriptionAnneeId,
          periodeScolaireId,
        },
      },
    });

    if (bulletinExistant) {
      throw new ConflictException(
        'Un bulletin existe déjà pour cet apprenant et cette période scolaire.',
      );
    }

    // Calculer la moyenne générale et les lignes par matière
    const { moyenneGenerale, lignes } = await this.calculerMoyenneEtLignes(
      inscription.classeScolaireId,
      inscriptionApprenantId,
      inscriptionAnneeId,
      periodeScolaireId,
    );

    // Créer le bulletin avec ses lignes associées
    return this.prisma.bulletin.create({
      data: {
        inscriptionApprenantId,
        inscriptionAnneeId,
        periodeScolaireId,
        moyenneGenerale,
        appreciation,
        decisionFinAnnee,
        documentUrl: '',
        estGenere: false,
        lignebulletin: {
          create: lignes.map((l) => ({
            matiereId: l.matiereId,
            moyenne: l.moyenne,
            coefficient: l.coefficient,
          })),
        },
      },
      include: {
        lignebulletin: {
          include: {
            matiere: true,
          },
        },
        periodescolaire: true,
      },
    });
  }

  // CALCULER LA MOYENNE GÉNÉRALE ET LES LIGNES DU BULLETIN
  private async calculerMoyenneEtLignes(
    classeScolaireId: string,
    inscriptionApprenantId: string,
    inscriptionAnneeId: string,
    periodeScolaireId: string,
  ) {
    // Récupérer toutes les matières assignées à la classe avec leurs coefficients
    const matieresClasse = await this.prisma.classematirere.findMany({
      where: { classeScolaireId },
      include: { matiere: true },
    });

    // Récupérer toutes les notes de l'élève pour cette période
    const notes = await this.prisma.note.findMany({
      where: {
        inscriptionApprenantId,
        inscriptionAnneeId,
        periodeScolaireId,
      },
      include: {
        affectationenseignant: true,
      },
    });

    // Regrouper les notes par matière ID
    const notesParMatiere = new Map<string, number[]>();
    for (const note of notes) {
      const matiereId = note.affectationenseignant.matiereId;
      if (!notesParMatiere.has(matiereId)) {
        notesParMatiere.set(matiereId, []);
      }
      notesParMatiere.get(matiereId)!.push(note.Valeur);
    }

    let totalPoints = 0;
    let totalCoefficients = 0;

    const lignes: Array<{
      matiereId: string;
      moyenne: number;
      coefficient: number;
    }> = [];

    for (const mc of matieresClasse) {
      const notesMatiere = notesParMatiere.get(mc.matiereId) || [];
      const coefficient = mc.coefficient;

      // Calcul de la moyenne de la matière (0 si aucune note)
      const moyenneMatiere =
        notesMatiere.length > 0
          ? notesMatiere.reduce((acc, val) => acc + val, 0) /
            notesMatiere.length
          : 0;

      totalPoints += moyenneMatiere * coefficient;
      totalCoefficients += coefficient;

      lignes.push({
        matiereId: mc.matiereId,
        moyenne: Number(moyenneMatiere.toFixed(2)),
        coefficient,
      });
    }

    const moyenneGenerale =
      totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;

    return {
      moyenneGenerale: Number(moyenneGenerale.toFixed(2)),
      lignes,
    };
  }

  // RECALCULER ET METTRE À JOUR LES RANGS D'UNE CLASSE
  async updateRangsClasse(
    classeScolaireId: string,
    anneeScolaireId: string,
    periodeScolaireId: string,
  ) {
    const bulletins = await this.prisma.bulletin.findMany({
      where: {
        periodeScolaireId,
        inscriptionAnneeId: anneeScolaireId,
        inscription: { classeScolaireId },
      },
      orderBy: { moyenneGenerale: 'desc' },
    });

    for (let i = 0; i < bulletins.length; i++) {
      await this.prisma.bulletin.update({
        where: {
          inscriptionApprenantId_inscriptionAnneeId_periodeScolaireId: {
            inscriptionApprenantId: bulletins[i].inscriptionApprenantId,
            inscriptionAnneeId: bulletins[i].inscriptionAnneeId,
            periodeScolaireId: bulletins[i].periodeScolaireId,
          },
        },
        data: { Rang: i + 1 },
      });
    }
  }

  // RÉCUPÉRER TOUS LES BULLETINS
  async findAll() {
    return this.prisma.bulletin.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        periodescolaire: true,
        lignebulletin: {
          include: {
            matiere: true,
          },
        },
        inscription: {
          include: {
            apprenant: true,
          },
        },
      },
    });
  }

  // RÉCUPÉRER UN BULLETIN
  async findOne(
    inscriptionApprenantId: string,
    inscriptionAnneeId: string,
    periodeScolaireId: string,
  ) {
    const bulletin = await this.prisma.bulletin.findUnique({
      where: {
        inscriptionApprenantId_inscriptionAnneeId_periodeScolaireId: {
          inscriptionApprenantId,
          inscriptionAnneeId,
          periodeScolaireId,
        },
      },
      include: {
        periodescolaire: true,
        lignebulletin: {
          include: {
            matiere: true,
          },
        },
        inscription: {
          include: {
            apprenant: true,
          },
        },
      },
    });

    if (!bulletin) {
      throw new NotFoundException('Bulletin introuvable.');
    }

    return bulletin;
  }

  // MODIFIER UN BULLETIN
  async update(
    inscriptionApprenantId: string,
    inscriptionAnneeId: string,
    periodeScolaireId: string,
    dto: UpdateBulletinDto,
  ) {
    await this.findOne(
      inscriptionApprenantId,
      inscriptionAnneeId,
      periodeScolaireId,
    );

    return this.prisma.bulletin.update({
      where: {
        inscriptionApprenantId_inscriptionAnneeId_periodeScolaireId: {
          inscriptionApprenantId,
          inscriptionAnneeId,
          periodeScolaireId,
        },
      },
      data: {
        ...(dto.appreciation !== undefined && {
          appreciation: dto.appreciation,
        }),
        ...(dto.decisionFinAnnee !== undefined && {
          decisionFinAnnee: dto.decisionFinAnnee,
        }),
        updatedAt: new Date(),
      },
      include: {
        periodescolaire: true,
        lignebulletin: {
          include: {
            matiere: true,
          },
        },
      },
    });
  }

  // SUPPRIMER UN BULLETIN
  async remove(
    inscriptionApprenantId: string,
    inscriptionAnneeId: string,
    periodeScolaireId: string,
  ) {
    await this.findOne(
      inscriptionApprenantId,
      inscriptionAnneeId,
      periodeScolaireId,
    );

    return this.prisma.bulletin.delete({
      where: {
        inscriptionApprenantId_inscriptionAnneeId_periodeScolaireId: {
          inscriptionApprenantId,
          inscriptionAnneeId,
          periodeScolaireId,
        },
      },
    });
  }

  // RÉCUPÉRER LES DONNÉES COMPLÈTES POUR LE PDF
  async getBulletinDataForPdf(dto: GenerateBulletinPdfDto) {
    const bulletin = await this.findOne(
      dto.inscriptionApprenantId,
      dto.inscriptionAnneeId,
      dto.periodeScolaireId,
    );

    const inscription = await this.prisma.inscription.findUnique({
      where: {
        apprenantId_anneeScolaireId: {
          apprenantId: dto.inscriptionApprenantId,
          anneeScolaireId: dto.inscriptionAnneeId,
        },
      },
      include: {
        apprenant: true,
        anneescolaire: {
          include: {
            ecole: true,
          },
        },
        classscolaire: true,
      },
    });

    if (!inscription) {
      throw new NotFoundException('Inscription introuvable.');
    }

    return {
      bulletin,
      ecole: inscription.anneescolaire.ecole,
      apprenant: inscription.apprenant,
      classe: inscription.classscolaire,
      anneeScolaire: inscription.anneescolaire,
    };
  }

  // GÉNÉRER LE PDF ET S'ENVOYER DIRECTEMENT SUR CLOUDINARY
  async generatePdf(
    inscriptionApprenantId: string,
    inscriptionAnneeId: string,
    periodeScolaireId: string,
  ) {
    const data = await this.getBulletinDataForPdf({
      inscriptionApprenantId,
      inscriptionAnneeId,
      periodeScolaireId,
    });

    const { bulletin, ecole, apprenant, classe, anneeScolaire } = data;

    // Créer le document PDFKit
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    // Streamer directement vers Cloudinary
    const uploadPromise = this.cloudinaryService.uploadStream(
      doc,
      'bulletins',
      'raw',
    );

    // En-tête de l'école
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text(ecole.nom, { align: 'center' });

    if (ecole.slogan) {
      doc
        .fontSize(10)
        .font('Helvetica-Oblique')
        .text(ecole.slogan, { align: 'center' });
    }

    if (ecole.ministereTutelle) {
      doc
        .moveDown(0.5)
        .fontSize(9)
        .font('Helvetica')
        .text(ecole.ministereTutelle, { align: 'center' });
    }

    if (ecole.adresse) {
      doc.text(ecole.adresse, { align: 'center' });
    }

    if (ecole.ville) {
      doc.text(ecole.ville, { align: 'center' });
    }

    if (ecole.telephone || ecole.email) {
      doc
        .moveDown(0.3)
        .text(
          `${ecole.telephone ?? ''}${
            ecole.telephone && ecole.email ? ' | ' : ''
          }${ecole.email ?? ''}`,
          { align: 'center' },
        );
    }

    // Titre du document
    doc
      .moveDown(1)
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('BULLETIN SCOLAIRE', { align: 'center' });

    doc
      .moveDown(0.5)
      .fontSize(11)
      .font('Helvetica')
      .text(`Année scolaire : ${anneeScolaire.nom ?? ''}`, { align: 'center' });

    // Informations apprenant
    doc.moveDown(1);
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Apprenant : ', { continued: true })
      .font('Helvetica')
      .text(`${apprenant.nom} ${apprenant.prenoms}`);

    doc
      .font('Helvetica-Bold')
      .text('Classe : ', { continued: true })
      .font('Helvetica')
      .text(classe.nom);

    // Moyenne générale
    doc.moveDown(0.7);
    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .text(`Moyenne générale : ${bulletin.moyenneGenerale.toFixed(2)}/20`, {
        align: 'center',
      });

    // Tableau des notes
    doc.moveDown(1);
    const tableTop = doc.y;
    const colMatiere = 40;
    const colMoyenne = 300;
    const colCoefficient = 390;
    const colPoints = 500;

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Matière', colMatiere, tableTop)
      .text('Moyenne', colMoyenne, tableTop)
      .text('Coef.', colCoefficient, tableTop)
      .text('Points', colPoints, tableTop);

    doc
      .moveTo(40, tableTop + 15)
      .lineTo(555, tableTop + 15)
      .stroke();

    let currentY = tableTop + 25;

    for (const ligne of bulletin.lignebulletin) {
      doc
        .font('Helvetica')
        .fontSize(9)
        .text(ligne.matiere.nom, colMatiere, currentY, { width: 240 })
        .text(`${ligne.moyenne.toFixed(2)}/20`, colMoyenne, currentY)
        .text(String(ligne.coefficient), colCoefficient, currentY)
        .text(
          (ligne.moyenne * ligne.coefficient).toFixed(2),
          colPoints,
          currentY,
        );

      currentY += 20;

      if (currentY > 720) {
        doc.addPage();
        currentY = 50;
      }
    }

    // Informations complémentaires
    currentY += 15;
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Rang : ', 40, currentY, { continued: true })
      .font('Helvetica')
      .text(bulletin.Rang ? `${bulletin.Rang}e` : 'Non disponible');

    currentY += 25;
    doc.font('Helvetica-Bold').text('Appréciation : ', 40, currentY);
    doc
      .font('Helvetica')
      .text(bulletin.appreciation ?? 'Aucune appréciation', 40, currentY + 18, {
        width: 500,
      });

    currentY += 60;
    doc
      .font('Helvetica-Bold')
      .text('Décision : ', 40, currentY, { continued: true })
      .font('Helvetica')
      .text(bulletin.decisionFinAnnee ?? 'N/A');

    // Signatures
    currentY += 60;
    doc.fontSize(10).font('Helvetica-Bold').text('Le Directeur', 80, currentY);
    doc.text('Le Professeur principal', 380, currentY);

    // Finaliser le PDF
    doc.end();

    // Attendre la résolution de l'upload vers Cloudinary
    const uploadResult = await uploadPromise;

    // Mettre à jour le bulletin en base
    const bulletinUpdated = await this.prisma.bulletin.update({
      where: {
        inscriptionApprenantId_inscriptionAnneeId_periodeScolaireId: {
          inscriptionApprenantId,
          inscriptionAnneeId,
          periodeScolaireId,
        },
      },
      data: {
        documentUrl: uploadResult.secure_url,
        estGenere: true,
        dateGeneration: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      message: 'Bulletin généré et sauvegardé avec succès',
      documentUrl: uploadResult.secure_url,
      bulletin: bulletinUpdated,
    };
  }

  // GÉNÉRER LES BULLETINS POUR UNE CLASSE
  async generateBulletinsForClasse(
    classeScolaireId: string,
    anneeScolaireId: string,
    periodeScolaireId: string,
  ): Promise<ResultatBulletinsClasse> {
    // Re-calculer d'abord les rangs de toute la classe
    await this.updateRangsClasse(
      classeScolaireId,
      anneeScolaireId,
      periodeScolaireId,
    );

    // Récupérer les inscriptions de la classe
    const inscriptions = await this.prisma.inscription.findMany({
      where: { classeScolaireId, anneeScolaireId },
      select: { apprenantId: true, anneeScolaireId: true },
    });

    const resultats: ResultatBulletinEleve[] = [];

    for (const inscription of inscriptions) {
      try {
        const bulletin = await this.generatePdf(
          inscription.apprenantId,
          inscription.anneeScolaireId,
          periodeScolaireId,
        );

        resultats.push({
          apprenantId: inscription.apprenantId,
          success: true,
          documentUrl: bulletin.documentUrl,
        });
      } catch (error) {
        resultats.push({
          apprenantId: inscription.apprenantId,
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
        });
      }
    }

    return {
      classeScolaireId,
      total: inscriptions.length,
      generes: resultats.filter((r) => r.success).length,
      echecs: resultats.filter((r) => !r.success).length,
      resultats,
    };
  }

  // GÉNÉRER LES BULLETINS POUR PLUSIEURS CLASSES
  async generateBulletinsForClasses(
    classeScolaireIds: string[],
    anneeScolaireId: string,
    periodeScolaireId: string,
  ) {
    const resultats: ResultatBulletinsClasse[] = [];

    for (const classeScolaireId of classeScolaireIds) {
      const resultat = await this.generateBulletinsForClasse(
        classeScolaireId,
        anneeScolaireId,
        periodeScolaireId,
      );
      resultats.push(resultat);
    }

    return { totalClasses: classeScolaireIds.length, resultats };
  }

  // GÉNÉRER LES BULLETINS POUR TOUTE L'ÉCOLE
  async generateBulletinsForSchool(
    ecoleId: string,
    anneeScolaireId: string,
    periodeScolaireId: string,
  ) {
    const classes = await this.prisma.classscolaire.findMany({
      where: { niveauscolaire: { ecoleId } },
      select: { id: true, nom: true },
    });

    const classeIds = classes.map((c) => c.id);

    const resultats = await this.generateBulletinsForClasses(
      classeIds,
      anneeScolaireId,
      periodeScolaireId,
    );

    return { ecoleId, ...resultats };
  }
}
