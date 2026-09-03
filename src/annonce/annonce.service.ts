import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnonceDto, UpdateAnnonceDto } from './dto/annonce.dto';

@Injectable()
export class AnnonceService {
  constructor(private readonly prisma: PrismaService) {}

  //Créer une annonce et ses cibles associées de manière atomique (Transaction)
  async create(dto: CreateAnnonceDto, ecoleId: string) {
    // Vérifier l'existence de l'auteur (Employé) dans l'école
    const employe = await this.prisma.employe.findFirst({
      where: {
        id: dto.auteurId,
        ecoleId,
      },
      select: { id: true },
    });

    if (!employe) {
      throw new NotFoundException(
        `L'employé (auteur) spécifié est introuvable dans cette école.`,
      );
    }

    // Calcul métier : dateExpiration = publication + 30 jours si non fournie
    const datePublication = new Date();
    const dateExpiration =
      dto.dateExpiration ??
      new Date(datePublication.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (dateExpiration <= datePublication) {
      throw new BadRequestException(
        "La date d'expiration doit être strictement postérieure à la date de publication.",
      );
    }

    // Création groupée de l'annonce avec ses cibles
    return this.prisma.annonce.create({
      data: {
        titre: dto.titre,
        contenu: dto.contenu,
        dateExpiration: new Date(dateExpiration),
        ecoleId,
        auteurId: dto.auteurId,
        cibleannonce: {
          create: dto.cibles.map((cible) => ({
            public: cible.public,
            classeScolaireId: cible.classeScolaireId ?? null,
          })),
        },
      },
      include: {
        employe: { include: { user: true } },
        cibleannonce: true,
      },
    });
  }

  //Récupérer toutes les annonces d'une école
  async findAllBySchool(ecoleId: string, onlyActive = false) {
    const now = new Date();

    return this.prisma.annonce.findMany({
      where: {
        ecoleId,
        ...(onlyActive
          ? {
              dateExpiration: { gte: now },
            }
          : {}),
      },
      include: {
        employe: { include: { user: true } },
        cibleannonce: true,
      },
      orderBy: { datePublication: 'desc' },
    });
  }

  //Récupérer une annonce spécifique par son ID
  async findOne(id: string, ecoleId: string) {
    const annonce = await this.prisma.annonce.findFirst({
      where: { id, ecoleId },
      include: {
        employe: { include: { user: true } },
        cibleannonce: true,
      },
    });

    if (!annonce) {
      throw new NotFoundException(
        `L'annonce avec l'ID '${id}' est introuvable dans cette école.`,
      );
    }

    return annonce;
  }

  //Mettre à jour une annonce et (optionnellement) remplacer ses cibles
  async update(id: string, dto: UpdateAnnonceDto, ecoleId: string) {
    const annonce = await this.findOne(id, ecoleId);

    const dateExpiration = dto.dateExpiration ?? annonce.dateExpiration;

    if (dto.dateExpiration) {
      if (dateExpiration <= annonce.datePublication) {
        throw new BadRequestException(
          "La date d'expiration doit être strictement postérieure à la date de publication.",
        );
      }
    }

    const { cibles, ...annonceData } = dto;

    return this.prisma.$transaction(async (tx) => {
      // Si de nouvelles cibles sont transmises, remplacer les anciennes
      if (cibles && cibles.length > 0) {
        await tx.cibleannonce.deleteMany({
          where: { annonceId: id },
        });

        await tx.cibleannonce.createMany({
          data: cibles.map((cible) => ({
            annonceId: id,
            public: cible.public,
            classeScolaireId: cible.classeScolaireId ?? null,
          })),
        });
      }

      return tx.annonce.update({
        where: { id },
        data: {
          ...annonceData,
        },
        include: {
          employe: { include: { user: true } },
          cibleannonce: true,
        },
      });
    });
  }

  //Supprimer une annonce (les cibles seront automatiquement supprimées en cascade grâce au schéma Prisma)
  async remove(id: string, ecoleId: string) {
    await this.findOne(id, ecoleId);

    return this.prisma.annonce.delete({
      where: { id },
    });
  }
}
