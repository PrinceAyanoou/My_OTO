import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationService } from './conversation.service';

describe('ConversationService', () => {
  let service: ConversationService;

  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const otherUserId = '660e8400-e29b-41d4-a716-446655440000';
  const ecoleId = '770e8400-e29b-41d4-a716-446655440000';
  const conversationId = '880e8400-e29b-41d4-a716-446655440000';

  const prismaMock = {
    user: { count: jest.fn() },
    conversation: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    participantconversation: { findUnique: jest.fn() },
    message: { create: jest.fn(), updateMany: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get<ConversationService>(ConversationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const baseDto = {
      type: 'GROUPE' as const,
      ecoleId,
      participantUserIds: [otherUserId],
      premierMessage: 'Bonjour',
    };

    it('crée une conversation de groupe avec des participants uniques', async () => {
      const conversation = { id: conversationId };
      prismaMock.user.count.mockResolvedValue(2);
      prismaMock.$transaction.mockImplementation(
        async (callback: (tx: typeof prismaMock) => Promise<unknown>) => {
          prismaMock.conversation.create.mockResolvedValue(conversation);
          return callback(prismaMock);
        },
      );

      await expect(service.create(baseDto, userId)).resolves.toBe(conversation);
      expect(prismaMock.conversation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'GROUPE',
            ecoleId,
            participantconversation: {
              createMany: {
                data: [{ userId: otherUserId }, { userId }],
              },
            },
            message: { create: { contenu: 'Bonjour' } },
          }),
        }),
      );
    });

    it('refuse une conversation privée avec un nombre invalide de participants', async () => {
      await expect(
        service.create(
          { ...baseDto, type: 'PRIVEE', participantUserIds: [userId] },
          userId,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.user.count).not.toHaveBeenCalled();
    });

    it('refuse des participants inexistants', async () => {
      prismaMock.user.count.mockResolvedValue(1);

      await expect(service.create(baseDto, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('retourne une conversation privée existante', async () => {
      const existing = { id: conversationId };
      prismaMock.user.count.mockResolvedValue(2);
      prismaMock.conversation.findFirst.mockResolvedValue(existing);

      await expect(
        service.create(
          { ...baseDto, type: 'PRIVEE', participantUserIds: [otherUserId] },
          userId,
        ),
      ).resolves.toBe(existing);
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('findAllForUser et findOne', () => {
    it('retourne les conversations de l’utilisateur dans l’école', async () => {
      const conversations = [{ id: conversationId }];
      prismaMock.conversation.findMany.mockResolvedValue(conversations);

      await expect(service.findAllForUser(userId, ecoleId)).resolves.toBe(
        conversations,
      );
      expect(prismaMock.conversation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            ecoleId,
            participantconversation: { some: { userId } },
          },
        }),
      );
    });

    it('refuse l’accès à une conversation sans appartenance', async () => {
      prismaMock.participantconversation.findUnique.mockResolvedValue(null);

      await expect(service.findOne(conversationId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prismaMock.conversation.findUnique).not.toHaveBeenCalled();
    });

    it('retourne une conversation accessible', async () => {
      const conversation = { id: conversationId };
      prismaMock.participantconversation.findUnique.mockResolvedValue({
        conversationId,
        userId,
      });
      prismaMock.conversation.findUnique.mockResolvedValue(conversation);

      await expect(service.findOne(conversationId, userId)).resolves.toBe(
        conversation,
      );
    });

    it('lève une erreur si la conversation accessible est introuvable', async () => {
      prismaMock.participantconversation.findUnique.mockResolvedValue({
        conversationId,
        userId,
      });
      prismaMock.conversation.findUnique.mockResolvedValue(null);

      await expect(service.findOne(conversationId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('sendMessage, markAsRead et remove', () => {
    beforeEach(() => {
      prismaMock.participantconversation.findUnique.mockResolvedValue({
        conversationId,
        userId,
      });
    });

    it('envoie un message et met à jour la conversation', async () => {
      const message = { id: 'message-1', contenu: 'Salut' };
      prismaMock.message.create.mockResolvedValue(message);
      prismaMock.conversation.update.mockResolvedValue({});
      prismaMock.$transaction.mockResolvedValue([message, {}]);

      await expect(
        service.sendMessage(conversationId, userId, { contenu: 'Salut' }),
      ).resolves.toBe(message);
      expect(prismaMock.message.create).toHaveBeenCalledWith({
        data: {
          conversationId,
          contenu: 'Salut',
          fichierUrl: undefined,
        },
      });
    });

    it('marque les messages non lus comme lus', async () => {
      const result = { count: 2 };
      prismaMock.message.updateMany.mockResolvedValue(result);

      await expect(service.markAsRead(conversationId, userId)).resolves.toBe(
        result,
      );
      expect(prismaMock.message.updateMany).toHaveBeenCalledWith({
        where: { conversationId, lu: false },
        data: { lu: true },
      });
    });

    it('supprime une conversation accessible', async () => {
      const deleted = { id: conversationId };
      prismaMock.conversation.delete.mockResolvedValue(deleted);

      await expect(service.remove(conversationId, userId)).resolves.toBe(
        deleted,
      );
      expect(prismaMock.conversation.delete).toHaveBeenCalledWith({
        where: { id: conversationId },
      });
    });
  });
});
