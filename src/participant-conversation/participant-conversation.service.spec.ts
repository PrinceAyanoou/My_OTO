import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ParticipantConversationService } from './participant-conversation.service';

describe('ParticipantConversationService', () => {
  let service: ParticipantConversationService;

  const prismaMock = {
    participantconversation: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      createMany: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    conversation: { findUnique: jest.fn() },
    user: { count: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipantConversationService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ParticipantConversationService>(
      ParticipantConversationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('liste les participants après vérification de l’appartenance', async () => {
    const conversationId = '11111111-1111-4111-8111-111111111111';
    const userId = '22222222-2222-4222-8222-222222222222';
    const response = [{ userId }];
    prismaMock.participantconversation.findUnique.mockResolvedValue({
      conversationId,
      userId,
    });
    prismaMock.participantconversation.findMany.mockResolvedValue(response);

    await expect(
      service.findAllByConversation(conversationId, userId),
    ).resolves.toBe(response);
    expect(prismaMock.participantconversation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { conversationId } }),
    );
  });

  it('refuse la liste si l’utilisateur n’est pas membre', async () => {
    prismaMock.participantconversation.findUnique.mockResolvedValue(null);

    await expect(
      service.findAllByConversation('conversation-1', 'user-1'),
    ).rejects.toThrow(
      new ForbiddenException(
        'Vous ne faites pas partie de cette conversation.',
      ),
    );
  });
});
