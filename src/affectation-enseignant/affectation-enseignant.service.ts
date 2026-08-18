import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateAffectationEnseignantDto,
  UpdateAffectationEnseignantDto,
  AffectationEnseignantQueryDto,
} from './dto/affectation-enseignant.dto';

@Injectable()
export class AffectationEnseignantService {
  constructor(private readonly prisma: PrismaService) {}

  //Créer une nouvelle affectation d'enseignant
  async create(ecoleId: string, dto: CreateAffectationEnseignantDto) {
    const { employeId, classeScolaireId, matiereId, anneeScolaireId } = dto;

    //Vérifier l'existence et la cohérence de l'employé pour l'école donnée
    const employe = await this.prisma.employe.findFirst({
      where: { id: employeId, ecoleId: ecoleId },
    });
    if (!employe) {
      throw new NotFoundException(
        `L'employé spécifié est introuvable pour cette école.`,
      );
    }

    // Vérifier que la classe appartient bien à l'école
    const classe = await this.prisma.classscolaire.findFirst({
      where: {
        id: classeScolaireId,
        niveauscolaire: { ecoleId: ecoleId },
      },
    });
    if (!classe) {
      throw new NotFoundException(
        `La classe scolaire est introuvable pour cette école.`,
      );
    }

    // Vérifier que la matière appartient à l'école
    const matiere = await this.prisma.matiere.findFirst({
      where: { id: matiereId, ecoleId: ecoleId },
    });
    if (!matiere) {
      throw new NotFoundException(
        `La matière est introuvable pour cette école.`,
      );
    }

    // Vérifier que l'année scolaire appartient à l'école
    const anneeScolaire = await this.prisma.anneescolaire.findFirst({
      where: { id: anneeScolaireId, ecoleId: ecoleId },
    });
    if (!anneeScolaire) {
      throw new NotFoundException(
        `L'année scolaire est introuvable pour cette école.`,
      );
    }

    // Unicité : Une matière dans une classe pour une année donnée ne peut avoir qu'un seul enseignant
    const existingAffectation =
      await this.prisma.affectationenseignant.findUnique({
        where: {
          matiereId_classeScolaireId_anneeScolaireId: {
            matiereId,
            classeScolaireId,
            anneeScolaireId,
          },
        },
      });

    if (existingAffectation) {
      throw new ConflictException(
        `Une affectation existe déjà pour cette matière dans cette classe pour cette année scolaire.`,
      );
    }

    // Création de l'affectation
    return this.prisma.affectationenseignant.create({
      data: {
        employeId,
        classeScolaireId,
        matiereId,
        anneeScolaireId,
      },
      include: {
        employe: {
          include: {
            user: { select: { nom: true, prenoms: true, email: true } },
          },
        },
        classscolaire: { select: { id: true, nom: true } },
        matiere: { select: { id: true, nom: true, CodeMat: true } },
        anneescolaire: { select: { id: true, nom: true } },
      },
    });
  }

  //Lister les affectations avec filtres et pagination
  async findAll(ecoleId: string, query: AffectationEnseignantQueryDto) {
    const existEcole = await this.prisma.ecole.findUnique({
      where: { id: ecoleId },
    });

    if (!existEcole) {
      throw new NotFoundException(`Cette école n'existe pas`);
    }
    const {
      page = 1,
      limit = 10,
      employeId,
      classeScolaireId,
      matiereId,
      anneeScolaireId,
    } = query;
    const skip = (page - 1) * limit;

    const where = {
      employe: { ecoleId },
      ...(employeId && { employeId }),
      ...(classeScolaireId && { classeScolaireId }),
      ...(matiereId && { matiereId }),
      ...(anneeScolaireId && { anneeScolaireId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.affectationenseignant.findMany({
        where,
        skip,
        take: limit,
        include: {
          employe: {
            include: {
              user: { select: { nom: true, prenoms: true, email: true } },
            },
          },
          classscolaire: { select: { id: true, nom: true } },
          matiere: { select: { id: true, nom: true, CodeMat: true } },
          anneescolaire: { select: { id: true, nom: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.affectationenseignant.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  //Récupérer une affectation par son ID
  async findOne(ecoleId: string, id: string) {
    const affectation = await this.prisma.affectationenseignant.findFirst({
      where: {
        id,
        employe: { ecoleId },
      },
      include: {
        employe: {
          include: {
            user: { select: { nom: true, prenoms: true, email: true } },
          },
        },
        classscolaire: { select: { id: true, nom: true } },
        matiere: { select: { id: true, nom: true, CodeMat: true } },
        anneescolaire: { select: { id: true, nom: true } },
        emploidutemps: true,
        evaluation: true,
      },
    });

    if (!affectation) {
      throw new NotFoundException(
        `L'affectation avec l'ID ${id} est introuvable.`,
      );
    }

    return affectation;
  }

  // Mettre à jour une affectation
  async update(
    ecoleId: string,
    id: string,
    dto: UpdateAffectationEnseignantDto,
  ) {
    const current = await this.findOne(ecoleId, id);

    const targetMatiereId = dto.matiereId ?? current.matiereId;
    const targetClasseId = dto.classeScolaireId ?? current.classeScolaireId;
    const targetAnneeId = dto.anneeScolaireId ?? current.anneeScolaireId;

    // Vérifier les contraintes si l'un des paramètres de la clé unique est modifié
    if (dto.matiereId || dto.classeScolaireId || dto.anneeScolaireId) {
      const existing = await this.prisma.affectationenseignant.findFirst({
        where: {
          matiereId: targetMatiereId,
          classeScolaireId: targetClasseId,
          anneeScolaireId: targetAnneeId,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Une autre affectation existe déjà pour ces nouveaux paramètres.`,
        );
      }
    }

    return this.prisma.affectationenseignant.update({
      where: { id },
      data: dto,
      include: {
        employe: {
          include: {
            user: { select: { nom: true, prenoms: true, email: true } },
          },
        },
        classscolaire: { select: { id: true, nom: true } },
        matiere: { select: { id: true, nom: true, CodeMat: true } },
        anneescolaire: { select: { id: true, nom: true } },
      },
    });
  }

  //Supprimer une affectation
  async remove(ecoleId: string, id: string) {
    await this.findOne(ecoleId, id);

    await this.prisma.affectationenseignant.delete({
      where: { id },
    });

    return { message: 'Affectation supprimée avec succès.' };
  }
}
