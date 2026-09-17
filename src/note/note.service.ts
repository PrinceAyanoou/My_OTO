import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StudentTokenService } from './hash.service';
import { ImportNotesExcelDto } from './dto/note-excel.dto';
import * as XLSX from 'xlsx';
import { Prisma } from 'src/generated/prisma';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';

interface ExcelNoteRow {
  REF_ELEVE: string;
  Matricule: string;
  Nom: string;
  Prénoms: string;
  Note: string;
  Observation: string;
}
@Injectable()
export class NoteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: StudentTokenService,
  ) {}

  //Générer et renvoyer le fichier Excel
  async generateClassSheet(
    classeScolaireId: string,
    evaluationId: string,
    ecoleId: string,
  ): Promise<Buffer> {
    await this.validateEvaluation(evaluationId, ecoleId);

    const classe = await this.prisma.classscolaire.findFirst({
      where: { id: classeScolaireId, niveauscolaire: { ecoleId } },
    });
    if (!classe) {
      throw new NotFoundException('Classe introuvable pour cette école.');
    }

    //Récupérer les inscriptions de la classe
    const inscriptions = await this.prisma.inscription.findMany({
      where: {
        classeScolaireId,
        anneescolaire: { ecoleId: ecoleId },
      },
      include: {
        apprenant: true,
        note: {
          where: {
            evaluationId: evaluationId,
          },
        },
      },
      orderBy: {
        apprenant: { nom: 'asc' },
      },
    });

    if (inscriptions.length <= 0) {
      throw new NotFoundException('Aucun élève inscrit dans cette classe.');
    }

    //Transformer les données avec le jeton
    const excelRows = inscriptions.map((ins) => {
      const existingNote = ins.note && ins.note.length > 0 ? ins.note[0] : null;

      return {
        REF_ELEVE: this.tokenService.encodeId(
          `${ins.apprenantId}:${ins.anneeScolaireId}`,
        ), // id masqué //on cocatène aussi apprenantId et anneScolaireId pour avoir un id unique.
        Matricule: ins.apprenant.matricule || 'N/A',
        Nom: ins.apprenant.nom.toUpperCase(),
        Prénoms: ins.apprenant.prenoms,
        Note: existingNote ? existingNote.Valeur : '',
        Observation: existingNote ? existingNote.Observation : '',
      };
    });

    //Génération du fichier Excel en mémoire
    const worksheet = XLSX.utils.json_to_sheet(excelRows);

    // Ajustement de la largeur des colonnes
    worksheet['!cols'] = [
      { wch: 40 }, // REF_ELEVE (Masqué)
      { wch: 30 }, // Matricule
      { wch: 20 }, // Nom
      { wch: 40 }, // Prénoms
      { wch: 10 }, // Note
      { wch: 40 }, // Observation
    ];

    //création du classeur et liaison avec la feuille de calcul.
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fiche de Notes');

    //mise en place du fichier téléchargeable par l'utilisateur.
    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    }) as Buffer;

    return buffer;
  }

  //Téléverser et enregistrer les notes lues à partir du fichier Excel
  async importFromExcel(
    file: Express.Multer.File,
    dto: ImportNotesExcelDto,
    ecoleId: string,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException(
        'Veuillez fournir un fichier Excel valide.',
      );
    }

    const evaluation = await this.prisma.evaluation.findFirst({
      where: {
        id: dto.evaluationId,
        periodescolaire: { anneescolaire: { ecoleId: ecoleId } },
      },
      include: { periodescolaire: true },
    });

    if (!evaluation) {
      throw new NotFoundException('Évaluation introuvable.');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json<ExcelNoteRow>(worksheet, {
      defval: '',
    });

    if (rawData.length === 0) {
      throw new BadRequestException('Le fichier transmis est vide.');
    }

    const report = {
      totalTraite: rawData.length,
      succes: 0,
      erreurs: [] as any[],
    };
    const notesToUpsert: Prisma.NoteUncheckedCreateInput[] = [];

    for (let index = 0; index < rawData.length; index++) {
      const row = rawData[index];
      const lineNum = index + 2;

      const refEleve = row.REF_ELEVE;
      const noteRaw = row.Note;
      const observation = row.Observation;

      if (!refEleve) {
        report.erreurs.push({
          ligne: lineNum,
          raison: 'La colonne de référence élève REF_ELEVE est absente.',
        });
        continue;
      }

      // Si la note est vide, on passe la ligne
      if (noteRaw === '' || noteRaw === null || noteRaw === undefined) {
        continue;
      }

      const noteValeur = parseFloat(noteRaw);
      if (isNaN(noteValeur) || noteValeur < 0 || noteValeur > dto.noteSur) {
        report.erreurs.push({
          ligne: lineNum,
          eleve: `${row['Nom']} ${row['Prénoms']}`,
          raison: `Note invalide (${noteRaw}). Le barème est de ${dto.noteSur}.`,
        });
        continue;
      }

      // Décodage de l'ID réel
      let apprenantId: string;
      let anneeScolaireId: string;
      try {
        const decoded = this.tokenService.decodeId(String(refEleve));

        [apprenantId, anneeScolaireId] = decoded.split(':');

        if (!apprenantId || !anneeScolaireId) {
          report.erreurs.push({
            ligne: lineNum,
            raison: 'Référence élève invalide.',
          });
          continue;
        }
      } catch (err) {
        report.erreurs.push({
          ligne: lineNum,
          raison: (err as Error).message,
        });
        continue;
      }

      try {
        await this.validateInscription(
          apprenantId,
          anneeScolaireId,
          ecoleId,
        );
      } catch (error) {
        report.erreurs.push({
          ligne: lineNum,
          raison: (error as Error).message,
        });
        continue;
      }

      notesToUpsert.push({
        Valeur: noteValeur,
        Observation: String(observation).trim(),
        noteSur: dto.noteSur,
        evaluationId: evaluation.id,
        affectationEnseignantId: evaluation.affectationId,
        typeEvaluationId: evaluation.typeEvaluationId,
        periodeScolaireId: evaluation.periodeScolaireId,
        inscriptionApprenantId: apprenantId,
        inscriptionAnneeId: anneeScolaireId,
      });
    }

    // Sauvegarde en base de données
    if (notesToUpsert.length > 0) {
      await this.prisma.$transaction(
        notesToUpsert.map((data: Prisma.NoteUncheckedCreateInput) =>
          this.prisma.note.create({
            data,
          }),
        ),
      );
      report.succes = notesToUpsert.length;
    }

    return report;
  }

  //CRUD
  //

  //Vérifie l'existence et les droits d'accès à une évaluation
  private async validateEvaluation(evaluationId: string, ecoleId: string) {
    const evaluation = await this.prisma.evaluation.findFirst({
      where: {
        id: evaluationId,
        periodescolaire: { anneescolaire: { ecoleId } },
      },
      include: { periodescolaire: true },
    });

    if (!evaluation) {
      throw new NotFoundException(
        `Évaluation introuvable ou vous n'avez pas les droits d'accès.`,
      );
    }

    return evaluation;
  }

  private async validateInscription(
    apprenantId: string,
    anneeScolaireId: string,
    ecoleId: string,
  ) {
    const inscription = await this.prisma.inscription.findFirst({
      where: {
        apprenantId,
        anneeScolaireId,
        anneescolaire: { ecoleId },
      },
    });

    if (!inscription) {
      throw new NotFoundException(
        "L'inscription de l'apprenant est introuvable dans cette école.",
      );
    }

    return inscription;
  }
  //
  //Créer ou mettre à jour une note individuelle
  async createOrUpdate(dto: CreateNoteDto, ecoleId: string) {
    const evaluation = await this.validateEvaluation(dto.evaluationId, ecoleId);
    await this.validateInscription(
      dto.inscriptionApprenantId,
      dto.inscriptionAnneeId,
      ecoleId,
    );

    if (dto.Valeur < 0 || dto.Valeur > dto.noteSur) {
      throw new BadRequestException(
        `La note doit être comprise entre 0 et ${dto.noteSur}.`,
      );
    }
    const existingNote = await this.prisma.note.findFirst({
      where: {
        inscriptionApprenantId: dto.inscriptionApprenantId,
        evaluationId: dto.evaluationId,
      },
    });

    if (existingNote) {
      return this.prisma.note.update({
        where: { id: existingNote.id },
        data: {
          Valeur: dto.Valeur,
          Observation: dto.Observation ? dto.Observation.trim() : undefined,
          noteSur: dto.noteSur,
        },
      });
    }

    return this.prisma.note.create({
      data: {
        Valeur: dto.Valeur,
        Observation: dto.Observation ? dto.Observation.trim() : '',
        noteSur: dto.noteSur,
        evaluationId: evaluation.id,
        affectationEnseignantId: evaluation.affectationId,
        typeEvaluationId: evaluation.typeEvaluationId,
        periodeScolaireId: evaluation.periodeScolaireId,
        inscriptionApprenantId: dto.inscriptionApprenantId,
        inscriptionAnneeId: dto.inscriptionAnneeId,
      },
    });
  }

  // Récupérer toutes les notes d'une évaluation
  async findByEvaluation(evaluationId: string, ecoleId: string) {
    await this.validateEvaluation(evaluationId, ecoleId);

    return this.prisma.note.findMany({
      where: { evaluationId },
      include: {
        inscription: {
          include: {
            apprenant: {
              select: {
                id: true,
                nom: true,
                prenoms: true,
                matricule: true,
              },
            },
          },
        },
      },
      orderBy: {
        inscription: {
          apprenant: { nom: 'asc' },
        },
      },
    });
  }

  //Récupérer toutes les notes d'un élève pour une année scolaire
  async findByApprenant(
    apprenantId: string,
    anneeScolaireId: string,
    ecoleId: string,
  ) {
    return this.prisma.note.findMany({
      where: {
        inscriptionApprenantId: apprenantId,
        inscriptionAnneeId: anneeScolaireId,
        periodescolaire: { anneescolaire: { ecoleId } },
      },
      include: {
        evaluation: true,
        typeevaluation: true,
        periodescolaire: true,
      },
    });
  }

  // Récupérer une note par son ID
  async findOne(id: string, ecoleId: string) {
    const note = await this.prisma.note.findFirst({
      where: {
        id,
        periodescolaire: { anneescolaire: { ecoleId } },
      },
      include: {
        inscription: true,
        evaluation: true,
      },
    });

    if (!note) {
      throw new NotFoundException(`La note avec l'ID "${id}" n'existe pas.`);
    }

    return note;
  }

  // Mettre à jour une note existante par son ID
  async update(id: string, dto: UpdateNoteDto, ecoleId: string) {
    const note = await this.findOne(id, ecoleId);

    const newNoteSur = dto.noteSur ?? note.noteSur;
    const newValeur = dto.Valeur ?? note.Valeur;

    if (newValeur < 0 || newValeur > newNoteSur) {
      throw new BadRequestException(
        `La note doit être comprise entre 0 et ${newNoteSur}.`,
      );
    }

    return this.prisma.note.update({
      where: { id },
      data: {
        Valeur: dto.Valeur,
        Observation: dto.Observation ? dto.Observation.trim() : undefined,
        noteSur: dto.noteSur,
      },
    });
  }

  //Supprimer une note
  async remove(id: string, ecoleId: string) {
    await this.findOne(id, ecoleId);

    return this.prisma.note.delete({
      where: { id },
    });
  }
}
