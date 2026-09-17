import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto, UpdateMessageDto } from './dto/message.dto';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  //Envoyer un message dans une conversation
  async create(
    conversationId: string,
    dto: CreateMessageDto,
    currentUserId: string,
  ) {
    await this.verifierAppartenance(conversationId, currentUserId);

    return this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId,
          contenu: dto.contenu,
          fichierUrl: dto.fichierUrl,
        },
      });

      // Mettre à jour le timestamp de la conversation pour le tri
      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return message;
    });
  }

  // Récupérer les messages d'une conversation avec pagination
  async findAllByConversation(
    conversationId: string,
    currentUserId: string,
    page = 1,
    limit = 20,
  ) {
    await this.verifierAppartenance(conversationId, currentUserId);

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { dateEnvoi: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.message.count({
        where: { conversationId },
      }),
    ]);

    return {
      data: messages.reverse(), // Inverser pour réafficher dans l'ordre chronologique
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Marquer tous les messages d'une conversation comme lus
  async markAsRead(conversationId: string, currentUserId: string) {
    await this.verifierAppartenance(conversationId, currentUserId);

    return this.prisma.message.updateMany({
      where: {
        conversationId,
        lu: false,
      },
      data: { lu: true },
    });
  }

  // Modifier le contenu d'un message
  async update(
    messageId: string,
    dto: UpdateMessageDto,
    currentUserId: string,
    conversationId: string,
  ) {
    const message = await this.prisma.message.findFirst({
      where: { id: messageId, conversationId },
    });

    if (!message) {
      throw new NotFoundException('Message introuvable.');
    }

    await this.verifierAppartenance(message.conversationId, currentUserId);

    return this.prisma.message.update({
      where: { id: messageId },
      data: { contenu: dto.contenu },
    });
  }

  // Supprimer un message
  async remove(
    messageId: string,
    currentUserId: string,
    conversationId: string,
  ) {
    const message = await this.prisma.message.findFirst({
      where: { id: messageId, conversationId },
    });

    if (!message) {
      throw new NotFoundException('Message introuvable.');
    }

    await this.verifierAppartenance(message.conversationId, currentUserId);

    return this.prisma.message.delete({
      where: { id: messageId },
    });
  }

  //Vérification privée de l'accès du membre à la conversation
  private async verifierAppartenance(conversationId: string, userId: string) {
    const membership = await this.prisma.participantconversation.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'Vous ne faites pas partie de cette conversation.',
      );
    }
  }
}
