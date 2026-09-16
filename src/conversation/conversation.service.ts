import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateConversationDto,
  CreateMessageDto,
} from './dto/conversation.dto';

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) {}

  // Créer une nouvelle conversation (Privée ou Groupe)
  async create(dto: CreateConversationDto, currentUserId: string) {
    const { type, ecoleId, participantUserIds, premierMessage } = dto;

    // Fusionner et dédupliquer les participants en s'assurant que l'émetteur y figure
    const allParticipantIds = Array.from(
      new Set([...participantUserIds, currentUserId]),
    );

    // Pour une conversation PRIVEE, s'assurer qu'il n'y a que 2 participants au total
    if (type === 'PRIVEE' && allParticipantIds.length !== 2) {
      throw new BadRequestException(
        'Une conversation privée doit contenir exactement deux participants.',
      );
    }

    // Vérifier l'existence de tous les utilisateurs
    const usersCount = await this.prisma.user.count({
      where: { id: { in: allParticipantIds } },
    });

    if (usersCount !== allParticipantIds.length) {
      throw new NotFoundException(
        'Un ou plusieurs participants spécifiés sont introuvables.',
      );
    }

    // Si c'est une conversation PRIVEE, vérifier si elle existe déjà entre ces deux utilisateurs
    if (type === 'PRIVEE') {
      const existingConversation = await this.prisma.conversation.findFirst({
        where: {
          type: 'PRIVEE',
          ecoleId,
          AND: allParticipantIds.map((userId) => ({
            participantconversation: {
              some: { userId },
            },
          })),
        },
        include: {
          participantconversation: {
            include: {
              user: {
                select: { id: true, nom: true, prenoms: true, email: true },
              },
            },
          },
          message: {
            orderBy: { dateEnvoi: 'asc' },
          },
        },
      });

      if (existingConversation) {
        return existingConversation;
      }
    }

    // Création transactionnelle de la conversation, des participants et du premier message éventuel
    return this.prisma.$transaction(async (tx) => {
      const conversation = await tx.conversation.create({
        data: {
          type,
          ecoleId,
          participantconversation: {
            createMany: {
              data: allParticipantIds.map((userId) => ({ userId })),
            },
          },
          ...(premierMessage && {
            message: {
              create: {
                contenu: premierMessage,
              },
            },
          }),
        },
        include: {
          participantconversation: {
            include: {
              user: {
                select: { id: true, nom: true, prenoms: true, email: true },
              },
            },
          },
          message: {
            take: 1,
            orderBy: { dateEnvoi: 'desc' },
          },
        },
      });

      return conversation;
    });
  }

  // Récupérer toutes les conversations de l'utilisateur connecté pour une école donnée
  async findAllForUser(userId: string, ecoleId: string) {
    return this.prisma.conversation.findMany({
      where: {
        ecoleId,
        participantconversation: {
          some: { userId },
        },
      },
      include: {
        participantconversation: {
          include: {
            user: {
              select: { id: true, nom: true, prenoms: true, email: true },
            },
          },
        },
        message: {
          take: 1,
          orderBy: { dateEnvoi: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // Récupérer les détails d'une conversation et son historique de messages
  async findOne(conversationId: string, userId: string) {
    await this.verifierAppartenance(conversationId, userId);

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participantconversation: {
          include: {
            user: {
              select: { id: true, nom: true, prenoms: true, email: true },
            },
          },
        },
        message: {
          orderBy: { dateEnvoi: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation introuvable.');
    }

    return conversation;
  }

  // Envoyer un message dans une conversation
  async sendMessage(
    conversationId: string,
    userId: string,
    dto: CreateMessageDto,
  ) {
    await this.verifierAppartenance(conversationId, userId);

    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          conversationId,
          contenu: dto.contenu,
          fichierUrl: dto.fichierUrl,
        },
      }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return message;
  }

  // Marquer tous les messages non lus de la conversation comme lus
  async markAsRead(conversationId: string, userId: string) {
    await this.verifierAppartenance(conversationId, userId);

    return this.prisma.message.updateMany({
      where: {
        conversationId,
        lu: false,
      },
      data: { lu: true },
    });
  }

  // Supprimer une conversation
  async remove(conversationId: string, userId: string) {
    await this.verifierAppartenance(conversationId, userId);

    return this.prisma.conversation.delete({
      where: { id: conversationId },
    });
  }

  // Vérification privée pour contrôler que l'utilisateur participe bien à la conversation
  private async verifierAppartenance(conversationId: string, userId: string) {
    const participant = await this.prisma.participantconversation.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!participant) {
      throw new ForbiddenException(
        'Vous ne faites pas partie de cette conversation.',
      );
    }
  }
}
