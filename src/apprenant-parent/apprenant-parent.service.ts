import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LinkApprenantDto } from './dto/apprenant-parent.dto';

@Injectable()
export class ApprenantParentService {
  constructor(private readonly prisma: PrismaService) {}

  // Lie un apprenant d'une école spécifique à un parent.
  async linkApprenant(
    parentId: string,
    dto: LinkApprenantDto,
    ecoleId: string,
  ) {
    // Vérifier que le parent existe
    const parent = await this.prisma.parent.findUnique({
      where: { id: parentId },
      select: { id: true },
    });

    if (!parent) {
      throw new NotFoundException(
        `Le parent avec l'ID '${parentId}' est introuvable.`,
      );
    }

    //Vérifier que l'apprenant existe ET appartient bien à l'école cible
    const apprenantInSchool = await this.prisma.apprenant.findFirst({
      where: {
        id: dto.apprenantId,
        inscription: {
          some: {
            anneescolaire: {
              ecoleId: ecoleId,
            },
          },
        },
      },
      select: { id: true },
    });

    if (!apprenantInSchool) {
      throw new NotFoundException(
        `L'apprenant avec l'ID '${dto.apprenantId}' n'existe pas ou n'est pas inscrit dans cette école.`,
      );
    }

    // Vérifier l'existence d'une liaison déjà établie
    const existingLink = await this.prisma.apprenantparent.findUnique({
      where: {
        apprenantId_parentId: {
          apprenantId: dto.apprenantId,
          parentId,
        },
      },
      select: { parentId: true },
    });

    if (existingLink) {
      throw new ConflictException('Cet apprenant est déjà lié à ce parent.');
    }

    // Créer l'association
    return this.prisma.apprenantparent.create({
      data: {
        parentId,
        apprenantId: dto.apprenantId,
        lien: dto.lien,
      },
      include: {
        apprenant: {
          include: {
            user: true,
          },
        },
        parent: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  //Supprime l'association entre un parent et un apprenant dans le cadre d'une école.
  async unlinkApprenant(
    parentId: string,
    apprenantId: string,
    ecoleId: string,
  ) {
    // Vérifier si l'apprenant fait partie de l'école
    const isApprenantInSchool = await this.prisma.apprenant.findFirst({
      where: {
        id: apprenantId,
        inscription: {
          some: {
            anneescolaire: {
              ecoleId: ecoleId,
            },
          },
        },
      },
      select: { id: true },
    });

    if (!isApprenantInSchool) {
      throw new NotFoundException(
        `L'apprenant spécifié est introuvable dans cette école.`,
      );
    }

    //Vérifier si la liaison existe
    const link = await this.prisma.apprenantparent.findUnique({
      where: {
        apprenantId_parentId: {
          apprenantId,
          parentId,
        },
      },
      select: { parentId: true },
    });

    if (!link) {
      throw new NotFoundException(
        "La liaison entre ce parent et cet apprenant n'existe pas.",
      );
    }

    // Supprimer la liaison
    return this.prisma.apprenantparent.delete({
      where: {
        apprenantId_parentId: {
          apprenantId,
          parentId,
        },
      },
    });
  }
}
