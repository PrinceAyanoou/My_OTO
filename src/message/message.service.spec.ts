import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateMessageDto, UpdateMessageDto } from './dto/message.dto';

describe('MessageService', () => {
  let service: MessageService;

  const txMock = {
    message: {
      create: jest.fn(),
    },
    conversation: {
      update: jest.fn(),
    },
  };

  const prismaMock = {
    participantconversation: {
      findUnique: jest.fn(),
    },
    message: {
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const conversationId = '11111111-1111-4111-8111-111111111111';
  const messageId = '22222222-2222-4222-8222-222222222222';
  const userId = 'user-1';

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation(
      (callback: (tx: typeof txMock) => Promise<unknown>) => callback(txMock),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('crée le message et actualise la conversation', async () => {
      const dto: CreateMessageDto = { contenu: 'Bonjour' };
      const response = { id: messageId, contenu: dto.contenu };
      prismaMock.participantconversation.findUnique.mockResolvedValue({
        conversationId,
        userId,
      });
      txMock.message.create.mockResolvedValue(response);

      await expect(service.create(conversationId, dto, userId)).resolves.toBe(
        response,
      );
      expect(txMock.message.create).toHaveBeenCalledWith({
        data: {
          conversationId,
          contenu: dto.contenu,
          fichierUrl: undefined,
        },
      });
      const updateCall = txMock.conversation.update.mock.calls[0] as [
        {
          where: { id: string };
          data: { updatedAt: Date };
        },
      ];
      const [updatePayload] = updateCall;

      expect(updatePayload.where).toEqual({ id: conversationId });
      expect(updatePayload.data.updatedAt).toBeInstanceOf(Date);
    });

    it('refuse la création si l’utilisateur n’est pas membre', async () => {
      prismaMock.participantconversation.findUnique.mockResolvedValue(null);

      await expect(
        service.create(conversationId, { contenu: 'Bonjour' }, userId),
      ).rejects.toThrow(
        new ForbiddenException(
          'Vous ne faites pas partie de cette conversation.',
        ),
      );
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('findAllByConversation', () => {
    it('retourne les messages dans l’ordre chronologique avec pagination', async () => {
      const messages = [{ id: 'new' }, { id: 'old' }];
      prismaMock.participantconversation.findUnique.mockResolvedValue({
        conversationId,
        userId,
      });
      prismaMock.message.findMany.mockResolvedValue(messages);
      prismaMock.message.count.mockResolvedValue(25);

      await expect(
        service.findAllByConversation(conversationId, userId, 2, 10),
      ).resolves.toEqual({
        data: [{ id: 'old' }, { id: 'new' }],
        meta: { total: 25, page: 2, limit: 10, totalPages: 3 },
      });
      expect(prismaMock.message.findMany).toHaveBeenCalledWith({
        where: { conversationId },
        orderBy: { dateEnvoi: 'desc' },
        skip: 10,
        take: 10,
      });
    });
  });

  describe('markAsRead', () => {
    it('marque les messages non lus', async () => {
      const response = { count: 2 };
      prismaMock.participantconversation.findUnique.mockResolvedValue({
        conversationId,
        userId,
      });
      prismaMock.message.updateMany.mockResolvedValue(response);

      await expect(service.markAsRead(conversationId, userId)).resolves.toBe(
        response,
      );
      expect(prismaMock.message.updateMany).toHaveBeenCalledWith({
        where: { conversationId, lu: false },
        data: { lu: true },
      });
    });
  });

  describe('update', () => {
    it('modifie un message appartenant à la conversation', async () => {
      const dto: UpdateMessageDto = { contenu: 'Message corrigé' };
      const response = { id: messageId, contenu: dto.contenu };
      prismaMock.message.findFirst.mockResolvedValue({
        id: messageId,
        conversationId,
      });
      prismaMock.participantconversation.findUnique.mockResolvedValue({
        conversationId,
        userId,
      });
      prismaMock.message.update.mockResolvedValue(response);

      await expect(
        service.update(messageId, dto, userId, conversationId),
      ).resolves.toBe(response);
      expect(prismaMock.message.update).toHaveBeenCalledWith({
        where: { id: messageId },
        data: { contenu: dto.contenu },
      });
    });

    it('lève NotFoundException si le message est introuvable', async () => {
      prismaMock.message.findFirst.mockResolvedValue(null);

      await expect(
        service.update(messageId, { contenu: 'Texte' }, userId, conversationId),
      ).rejects.toThrow(new NotFoundException('Message introuvable.'));
      expect(
        prismaMock.participantconversation.findUnique,
      ).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('supprime un message après vérification de l’appartenance', async () => {
      const response = { id: messageId };
      prismaMock.message.findFirst.mockResolvedValue({
        id: messageId,
        conversationId,
      });
      prismaMock.participantconversation.findUnique.mockResolvedValue({
        conversationId,
        userId,
      });
      prismaMock.message.delete.mockResolvedValue(response);

      await expect(
        service.remove(messageId, userId, conversationId),
      ).resolves.toBe(response);
      expect(prismaMock.message.delete).toHaveBeenCalledWith({
        where: { id: messageId },
      });
    });
  });
});
