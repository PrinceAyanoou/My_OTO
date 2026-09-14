import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

import {
  CreateBulletinDto,
  GenerateBulletinPdfDto,
  UpdateBulletinDto,
} from './dto/bulletin.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

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

  //Créer un Bulletin
  async create(dto: CreateBulletinDto) {
    const {
      inscriptionApprenantId,
      inscriptionAnneeId,
      periodeScolaireId,
      appreciation,
      decisionFinAnnee,
    } = dto;

    //Vérifier que l'inscription existe.
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
        'L’inscription de cet apprenant pour cette année scolaire est introuvable.',
      );
    }
    //vérifier l'existence de la période scolaire
    const periode = await this.prisma.periodescolaire.findUnique({
      where: {
        id: periodeScolaireId,
      },
    });

    if (!periode) {
      throw new NotFoundException(
        'La période scolaire demandée est introuvable.',
      );
    }

    //vérifier l'existence ultérieure du bulletin
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

    //calculer la moyenne.
    const moyenneGenerale = await this.calculerMoyenneGenerale(
      inscriptionApprenantId,
      inscriptionAnneeId,
      periodeScolaireId,
    );

    //Créer le bulletin.
    const bulletin = await this.prisma.bulletin.create({
      data: {
        inscriptionApprenantId,
        inscriptionAnneeId,
        periodeScolaireId,

        moyenneGenerale,

        appreciation,
        decisionFinAnnee,

        // Ces valeurs seront mises à jour lors de la génération du PDF
        documentUrl: '',
        estGenere: false,
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

    return bulletin;
  }

  /**
   * ============================================================
   * CALCUL DE LA MOYENNE GÉNÉRALE
   * ============================================================
   *
   * Pour l'instant :
   *
   * - on récupère les notes de la période
   * - on regroupe les notes par matière
   * - on calcule la moyenne de chaque matière
   * - on applique le coefficient de la matière
   * - on obtient la moyenne générale pondérée
   *
   * La politique d'évaluation pourra ensuite être intégrée ici.
   */
  private async calculerMoyenneGenerale(
    inscriptionApprenantId: string,
    inscriptionAnneeId: string,
    periodeScolaireId: string,
  ): Promise<number> {
    //Récupérer l'inscription avec sa classe.
    const inscription = await this.prisma.inscription.findUnique({
      where: {
        apprenantId_anneeScolaireId: {
          apprenantId: inscriptionApprenantId,
          anneeScolaireId: inscriptionAnneeId,
        },
      },
    });

    if (!inscription) {
      throw new NotFoundException('Inscription introuvable.');
    }

    //Récupérer les notes de l'apprenant pour cette période.
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

    if (notes.length === 0) {
      return 0;
    }

    //Récupérer les coefficients des matières de la salle de classe.
    const matieresClasse = await this.prisma.classematirere.findMany({
      where: {
        classeScolaireId: inscription.classeScolaireId,
      },
      include: {
        matiere: true,
      },
    });

    // Regrouper les notes par matière
    const notesParMatiere = new Map<string, number[]>();

    for (const note of notes) {
      const matiereId = note.affectationenseignant.matiereId;

      if (!notesParMatiere.has(matiereId)) {
        notesParMatiere.set(matiereId, []);
      }

      notesParMatiere.get(matiereId)!.push(note.Valeur);
    }

    // Calcul de la moyenne pondérée
    let totalPoints = 0;
    let totalCoefficients = 0;

    for (const matiereClasse of matieresClasse) {
      const notesMatiere = notesParMatiere.get(matiereClasse.matiereId);

      // Aucune note dans cette matière
      if (!notesMatiere || notesMatiere.length === 0) {
        continue;
      }

      // Moyenne simple des notes de la matière
      const moyenneMatiere =
        notesMatiere.reduce((total, note) => total + note, 0) /
        notesMatiere.length;

      const coefficient = matiereClasse.coefficient;

      totalPoints += moyenneMatiere * coefficient;
      totalCoefficients += coefficient;
    }

    if (totalCoefficients === 0) {
      return 0;
    }

    const moyenneGenerale = totalPoints / totalCoefficients;

    // Arrondi à 2 chiffres après la virgule
    return Number(moyenneGenerale.toFixed(2));
  }

  //RÉCUPÉRER TOUS LES BULLETINS
  async findAll() {
    return this.prisma.bulletin.findMany({
      orderBy: {
        createdAt: 'desc',
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
  }

  //RÉCUPÉRER UN BULLETIN
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

  //SUPPRIMER UN BULLETIN
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

  //PRÉPARER LA GÉNÉRATION DU PDF
  async getBulletinDataForPdf(dto: GenerateBulletinPdfDto) {
    const bulletin = await this.findOne(
      dto.inscriptionApprenantId,
      dto.inscriptionAnneeId,
      dto.periodeScolaireId,
    );

    /**
     * On récupère les informations nécessaires
     * pour construire l'en-tête personnalisé de l'école.
     */
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

  //
  //
  async generatePdf(
    inscriptionApprenantId: string,
    inscriptionAnneeId: string,
    periodeScolaireId: string,
  ) {
    // RÉCUPÉRER LES DONNÉES DU BULLETIN
    const data = await this.getBulletinDataForPdf({
      inscriptionApprenantId,
      inscriptionAnneeId,
      periodeScolaireId,
    });

    const { bulletin, ecole, apprenant, classe, anneeScolaire } = data;

    // CRÉER LE DOCUMENT PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
    });

    // STOCKER LE PDF EN MÉMOIRE
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    //ATTENDRE LA FIN DE LA GÉNÉRATION
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on('error', (error) => {
        reject(error);
      });

      // EN-TÊTE DE L'ÉCOLE
      doc.fontSize(16).font('Helvetica-Bold').text(ecole.nom, {
        align: 'center',
      });

      if (ecole.slogan) {
        doc.fontSize(10).font('Helvetica-Oblique').text(ecole.slogan, {
          align: 'center',
        });
      }

      if (ecole.ministereTutelle) {
        doc
          .moveDown(0.5)
          .fontSize(9)
          .font('Helvetica')
          .text(ecole.ministereTutelle, {
            align: 'center',
          });
      }

      if (ecole.adresse) {
        doc.text(ecole.adresse, {
          align: 'center',
        });
      }

      if (ecole.ville) {
        doc.text(ecole.ville, {
          align: 'center',
        });
      }

      if (ecole.telephone || ecole.email) {
        doc
          .moveDown(0.3)
          .text(
            `${ecole.telephone ?? ''}${
              ecole.telephone && ecole.email ? ' | ' : ''
            }${ecole.email ?? ''}`,
            {
              align: 'center',
            },
          );
      }

      //  TITRE DU BULLETIN
      doc
        .moveDown(1)
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('BULLETIN SCOLAIRE', {
          align: 'center',
        });

      doc
        .moveDown(0.5)
        .fontSize(11)
        .font('Helvetica')
        .text(`Année scolaire : ${anneeScolaire.nom ?? ''}`, {
          align: 'center',
        });

      // INFORMATIONS DE L'APPRENANT
      doc.moveDown(1);

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Apprenant : ', {
          continued: true,
        })
        .font('Helvetica')
        .text(`${apprenant.nom} ${apprenant.prenoms}`);

      doc
        .font('Helvetica-Bold')
        .text('Classe : ', {
          continued: true,
        })
        .font('Helvetica')
        .text(classe.nom);

      //MOYENNE GÉNÉRALE
      doc.moveDown(0.7);

      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .text(`Moyenne générale : ${bulletin.moyenneGenerale.toFixed(2)}/20`, {
          align: 'center',
        });

      // TABLEAU DES MATIÈRES
      doc.moveDown(1);

      const tableTop = doc.y;

      const colMatiere = 40;
      const colMoyenne = 300;
      const colCoefficient = 390;
      const colPoints = 500;

      // En-tête du tableau
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

      //  LIGNES DES MATIÈRES
      for (const ligne of bulletin.lignebulletin) {
        doc
          .font('Helvetica')
          .fontSize(9)
          .text(ligne.matiere.nom, colMatiere, currentY, {
            width: 240,
          })
          .text(`${ligne.moyenne.toFixed(2)}/20`, colMoyenne, currentY)
          .text(String(ligne.coefficient), colCoefficient, currentY)
          .text(
            (ligne.moyenne * ligne.coefficient).toFixed(2),
            colPoints,
            currentY,
          );

        currentY += 20;

        //Pour  Éviter de sortir de la page

        if (currentY > 720) {
          doc.addPage();
          currentY = 50;
        }
      }

      // RANG
      currentY += 15;

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Rang : ', 40, currentY, {
          continued: true,
        })
        .font('Helvetica')
        .text(bulletin.Rang ? `${bulletin.Rang}e` : 'Non disponible');

      //  APPRÉCIATION
      currentY += 25;

      doc.font('Helvetica-Bold').text('Appréciation : ', 40, currentY);

      doc
        .font('Helvetica')
        .text(
          bulletin.appreciation ?? 'Aucune appréciation',
          40,
          currentY + 18,
          {
            width: 500,
          },
        );

      // DÉCISION DE FIN D'ANNÉE
      currentY += 60;

      doc
        .font('Helvetica-Bold')
        .text('Décision : ', 40, currentY, {
          continued: true,
        })
        .font('Helvetica')
        .text(bulletin.decisionFinAnnee);

      // SIGNATURES
      currentY += 60;

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Le Directeur', 80, currentY);

      doc.text('Le Professeur principal', 380, currentY);

      //TERMINER LE PDF
      doc.end();
    });

    //  ENVOYER LE PDF À CLOUDINARY
    const uploadResult = await this.cloudinaryService.uploadBuffer(
      pdfBuffer,
      'bulletins',
      'raw',
    );

    // SAUVEGARDER L'URL DANS LA BASE DE DONNÉES
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

    // RETOURNER LE RÉSULTAT
    return {
      message: 'Bulletin généré et sauvegardé avec succès',
      documentUrl: uploadResult.secure_url,
      bulletin: bulletinUpdated,
    };
  }

  //Générer tous les bulletins d'une classe
  async generateBulletinsForClasse(
    classeScolaireId: string,
    anneeScolaireId: string,
    periodeScolaireId: string,
  ): Promise<ResultatBulletinsClasse> {
    const inscriptions = await this.prisma.inscription.findMany({
      where: {
        classeScolaireId,
        anneeScolaireId,
      },
      select: {
        apprenantId: true,
        anneeScolaireId: true,
      },
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

  //Générer tous les bulletins de plusieurs classes.
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

    return {
      totalClasses: classeScolaireIds.length,
      resultats,
    };
  }

  //Générer tous les bulletins de toute l'école
  async generateBulletinsForSchool(
    ecoleId: string,
    anneeScolaireId: string,
    periodeScolaireId: string,
  ) {
    const classes = await this.prisma.classscolaire.findMany({
      where: {
        niveauscolaire: {
          ecoleId: ecoleId,
        },
      },
      select: {
        id: true,
        nom: true,
      },
    });

    const classeIds = classes.map((classe) => classe.id);

    const resultats = await this.generateBulletinsForClasses(
      classeIds,
      anneeScolaireId,
      periodeScolaireId,
    );

    return {
      ecoleId,
      ...resultats,
    };
  }
}
