import { Test, TestingModule } from '@nestjs/testing';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';

describe('ConversationController', () => {
  let controller: ConversationController;

  const serviceMock = {
    create: jest.fn(),
    findAllForUser: jest.fn(),
    findOne: jest.fn(),
    sendMessage: jest.fn(),
    markAsRead: jest.fn(),
    remove: jest.fn(),
  };

  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const conversationId = '660e8400-e29b-41d4-a716-446655440000';
  const ecoleId = '770e8400-e29b-41d4-a716-446655440000';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationController],
      providers: [{ provide: ConversationService, useValue: serviceMock }],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ConversationController>(ConversationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue la création avec l’utilisateur courant', async () => {
    const dto = {
      type: 'GROUPE' as const,
      ecoleId,
      participantUserIds: [userId],
      premierMessage: 'Bonjour',
    };
    const result = { id: conversationId };
    serviceMock.create.mockResolvedValue(result);

    await expect(controller.create(dto, userId)).resolves.toBe(result);
    expect(serviceMock.create).toHaveBeenCalledWith(dto, userId);
  });

  it('délègue la recherche des conversations de l’utilisateur', async () => {
    const result = [{ id: conversationId }];
    serviceMock.findAllForUser.mockResolvedValue(result);

    await expect(controller.findAllForUser(ecoleId, userId)).resolves.toBe(
      result,
    );
    expect(serviceMock.findAllForUser).toHaveBeenCalledWith(userId, ecoleId);
  });

  it('délègue la recherche d’une conversation', async () => {
    const result = { id: conversationId };
    serviceMock.findOne.mockResolvedValue(result);

    await expect(controller.findOne(conversationId, userId)).resolves.toBe(
      result,
    );
    expect(serviceMock.findOne).toHaveBeenCalledWith(conversationId, userId);
  });

  it('délègue l’envoi d’un message', async () => {
    const dto = { contenu: 'Salut' };
    const result = { id: 'message-1', contenu: 'Salut' };
    serviceMock.sendMessage.mockResolvedValue(result);

    await expect(
      controller.sendMessage(conversationId, dto, userId),
    ).resolves.toBe(result);
    expect(serviceMock.sendMessage).toHaveBeenCalledWith(
      conversationId,
      userId,
      dto,
    );
  });

  it('délègue le marquage comme lu', async () => {
    const result = { count: 2 };
    serviceMock.markAsRead.mockResolvedValue(result);

    await expect(controller.markAsRead(conversationId, userId)).resolves.toBe(
      result,
    );
    expect(serviceMock.markAsRead).toHaveBeenCalledWith(conversationId, userId);
  });

  it('délègue la suppression', async () => {
    const result = { id: conversationId };
    serviceMock.remove.mockResolvedValue(result);

    await expect(controller.remove(conversationId, userId)).resolves.toBe(
      result,
    );
    expect(serviceMock.remove).toHaveBeenCalledWith(conversationId, userId);
  });
});
