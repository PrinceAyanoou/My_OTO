import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddParticipantsDto,
  UpdateParticipantRoleDto,
} from './dto/participant-conversation.dto';

@Injectable()
export class ParticipantConversationService {
  constructor(private readonly prisma: PrismaService) {}

  //Ajouter des participants à une conversation (Groupe)
  async addParticipants(
    conversationId: string,
    dto: AddParticipantsDto,
    currentUserId: string,
  ) {
    const { userIds, role } = dto;

    // Vérifier que la conversation existe et qu'il s'agit d'un GROUPE
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participantconversation: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation introuvable.');
    }

    if (conversation.type === 'PRIVEE') {
      throw new BadRequestException(
        'Impossible d’ajouter des participants à une conversation privée.',
      );
    }

    // Vérifier si l'utilisateur courant est membre (ou ADMIN selon la logique métier)
    const isMember = conversation.participantconversation.some(
      (p) => p.userId === currentUserId,
    );
    if (!isMember) {
      throw new ForbiddenException(
        'Vous ne faites pas partie de cette conversation.',
      );
    }

    // Filtrer les utilisateurs déjà présents
    const existingUserIds = new Set(
      conversation.participantconversation.map((p) => p.userId),
    );
    const newUsersToAdd = userIds.filter((id) => !existingUserIds.has(id));

    if (newUsersToAdd.length === 0) {
      throw new ConflictException(
        'Tous les utilisateurs spécifiés font déjà partie de la conversation.',
      );
    }

    // Vérifier l'existence des nouveaux utilisateurs
    const count = await this.prisma.user.count({
      where: { id: { in: newUsersToAdd } },
    });
    if (count !== newUsersToAdd.length) {
      throw new NotFoundException(
        'Un ou plusieurs utilisateurs à ajouter sont introuvables.',
      );
    }

    // Ajout en masse des participants
    await this.prisma.participantconversation.createMany({
      data: newUsersToAdd.map((userId) => ({
        conversationId,
        userId,
        role: role || 'MEMBRE',
      })),
    });

    return this.prisma.participantconversation.findMany({
      where: {
        conversationId,
        userId: { in: newUsersToAdd },
      },
      include: {
        user: {
          select: { id: true, nom: true, prenoms: true, email: true },
        },
      },
    });
  }

  //Retirer un participant d'une conversation (ou quitter la conversation)
  async removeParticipant(
    conversationId: string,
    targetUserId: string,
    currentUserId: string,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participantconversation: true },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation introuvable.');
    }

    // Autoriser le retrait si c'est soi-même (quitter) ou si l'initiateur est ADMIN
    const currentParticipant = conversation.participantconversation.find(
      (p) => p.userId === currentUserId,
    );

    if (!currentParticipant) {
      throw new ForbiddenException(
        'Vous ne faites pas partie de cette conversation.',
      );
    }

    const isSelfRemoval = targetUserId === currentUserId;
    const isAdmin = currentParticipant.role === 'ADMIN';

    if (!isSelfRemoval && !isAdmin) {
      throw new ForbiddenException(
        'Seul un administrateur peut retirer un autre membre.',
      );
    }

    // Suppression du membre
    return this.prisma.participantconversation.delete({
      where: {
        conversationId_userId: {
          conversationId,
          userId: targetUserId,
        },
      },
    });
  }

  //Modifier le rôle d'un participant
  async updateRole(
    conversationId: string,
    targetUserId: string,
    dto: UpdateParticipantRoleDto,
    currentUserId: string,
  ) {
    // Seul un ADMIN de la conversation peut changer le rôle d'un membre
    const currentParticipant =
      await this.prisma.participantconversation.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId: currentUserId,
          },
        },
      });

    if (!currentParticipant || currentParticipant.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Droits insuffisants. Vous devez être administrateur.',
      );
    }

    return this.prisma.participantconversation.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: targetUserId,
        },
      },
      data: { role: dto.role },
      include: {
        user: {
          select: { id: true, nom: true, prenoms: true, email: true },
        },
      },
    });
  }

  // Lister tous les participants d'une conversation
  async findAllByConversation(conversationId: string, currentUserId: string) {
    // Vérification de l'appartenance
    const membership = await this.prisma.participantconversation.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUserId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'Vous ne faites pas partie de cette conversation.',
      );
    }

    return this.prisma.participantconversation.findMany({
      where: { conversationId },
      include: {
        user: {
          select: { id: true, nom: true, prenoms: true, email: true },
        },
      },
    });
  }
}
