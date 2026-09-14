import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import {
  CreateLigneBulletinDto,
  UpdateLigneBulletinDto,
} from './dto/ligne-bulletin.dto';

@Injectable()
export class LigneBulletinService {
  constructor(private readonly prisma: PrismaService) {}

  //Créer une ligne de bulletin
  async create(dto: CreateLigneBulletinDto) {
    //Vérifier que le bulletin existe
    const bulletin = await this.prisma.bulletin.findUnique({
      where: {
        inscriptionApprenantId_inscriptionAnneeId_periodeScolaireId: {
          inscriptionApprenantId: dto.bulletinApprenantId,
          inscriptionAnneeId: dto.bulletinAnneeId,
          periodeScolaireId: dto.bulletinId,
        },
      },

      include: {
        inscription: {
          include: {
            classscolaire: true,
          },
        },
      },
    });

    if (!bulletin) {
      throw new NotFoundException('Le bulletin indiqué est introuvable');
    }

    // Vérifier que la matière existe
    const matiere = await this.prisma.matiere.findUnique({
      where: {
        id: dto.matiereId,
      },
    });

    if (!matiere) {
      throw new NotFoundException('La matière indiquée est introuvable');
    }

    //Vérifier que la matière appartient à la classe
    const classeMatiere = await this.prisma.classematirere.findUnique({
      where: {
        classeScolaireId_matiereId: {
          classeScolaireId: bulletin.inscription.classeScolaireId,
          matiereId: dto.matiereId,
        },
      },
    });

    if (!classeMatiere) {
      throw new ConflictException(
        'Cette matière n’est pas associée à la classe de l’apprenant',
      );
    }

    // Vérifier qu'il n'existe pas déjà cette matière
    const ligneExistante = await this.prisma.lignebulletin.findFirst({
      where: {
        bulletinApprenantId: dto.bulletinApprenantId,
        bulletinAnneeId: dto.bulletinAnneeId,
        bulletinId: dto.bulletinId,
        matiereId: dto.matiereId,
      },
    });

    if (ligneExistante) {
      throw new ConflictException('Cette matière existe déjà dans ce bulletin');
    }

    //Créer la ligne
    return this.prisma.lignebulletin.create({
      data: {
        bulletinApprenantId: dto.bulletinApprenantId,
        bulletinAnneeId: dto.bulletinAnneeId,
        bulletinId: dto.bulletinId,

        matiereId: dto.matiereId,

        moyenne: dto.moyenne,

        // Récupéré depuis la configuration de la classe
        coefficient: classeMatiere.coefficient,
      },

      include: {
        matiere: true,
        bulletin: {
          include: {
            inscription: {
              include: {
                apprenant: true,
                classscolaire: true,
              },
            },
            periodescolaire: true,
          },
        },
      },
    });
  }

  //Récupérer toutes les lignes de bulletin
  async findAll() {
    return this.prisma.lignebulletin.findMany({
      include: {
        matiere: true,
        bulletin: {
          include: {
            periodescolaire: true,
          },
        },
      },

      orderBy: {
        matiere: {
          nom: 'asc',
        },
      },
    });
  }

  // Récupérer une ligne précise
  async findOne(
    bulletinApprenantId: string,
    bulletinAnneeId: string,
    bulletinId: string,
    matiereId: string,
  ) {
    const ligne = await this.prisma.lignebulletin.findFirst({
      where: {
        bulletinApprenantId,
        bulletinAnneeId,
        bulletinId,
        matiereId,
      },

      include: {
        matiere: true,
        bulletin: {
          include: {
            inscription: {
              include: {
                apprenant: true,
                classscolaire: true,
              },
            },
            periodescolaire: true,
          },
        },
      },
    });

    if (!ligne) {
      throw new NotFoundException('La ligne de bulletin est introuvable');
    }

    return ligne;
  }

  //Récupérer toutes les lignes d'un bulletin
  async findByBulletin(
    bulletinApprenantId: string,
    bulletinAnneeId: string,
    bulletinId: string,
  ) {
    // Vérifier que le bulletin existe
    const bulletin = await this.prisma.bulletin.findUnique({
      where: {
        inscriptionApprenantId_inscriptionAnneeId_periodeScolaireId: {
          inscriptionApprenantId: bulletinApprenantId,
          inscriptionAnneeId: bulletinAnneeId,
          periodeScolaireId: bulletinId,
        },
      },
    });

    if (!bulletin) {
      throw new NotFoundException('Le bulletin indiqué est introuvable');
    }

    return this.prisma.lignebulletin.findMany({
      where: {
        bulletinApprenantId,
        bulletinAnneeId,
        bulletinId,
      },

      include: {
        matiere: true,
      },

      orderBy: {
        matiere: {
          nom: 'asc',
        },
      },
    });
  }

  //Modifier une ligne
  async update(
    bulletinApprenantId: string,
    bulletinAnneeId: string,
    bulletinId: string,
    matiereId: string,
    dto: UpdateLigneBulletinDto,
  ) {
    const ligne = await this.prisma.lignebulletin.findFirst({
      where: {
        bulletinApprenantId,
        bulletinAnneeId,
        bulletinId,
        matiereId,
      },
    });

    if (!ligne) {
      throw new NotFoundException('La ligne de bulletin est introuvable');
    }

    return this.prisma.lignebulletin.update({
      where: {
        id: ligne.id,
      },

      data: {
        moyenne: dto.moyenne,
      },

      include: {
        matiere: true,
        bulletin: {
          include: {
            periodescolaire: true,
          },
        },
      },
    });
  }

  // Supprimer une ligne
  async remove(
    bulletinApprenantId: string,
    bulletinAnneeId: string,
    bulletinId: string,
    matiereId: string,
  ) {
    const ligne = await this.prisma.lignebulletin.findFirst({
      where: {
        bulletinApprenantId,
        bulletinAnneeId,
        bulletinId,
        matiereId,
      },
    });

    if (!ligne) {
      throw new NotFoundException('La ligne de bulletin est introuvable');
    }

    await this.prisma.lignebulletin.delete({
      where: {
        id: ligne.id,
      },
    });

    return {
      message: 'La ligne de bulletin a été supprimée avec succès',
    };
  }
}
