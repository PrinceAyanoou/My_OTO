import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';

describe('MessageController', () => {
  let controller: MessageController;

  const messageServiceMock = {
    create: jest.fn(),
    findAllByConversation: jest.fn(),
    markAsRead: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: MessageService,
          useValue: messageServiceMock,
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<MessageController>(MessageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue la création d’un message', async () => {
    const conversationId = '11111111-1111-4111-8111-111111111111';
    const user = { sub: 'user-1' };
    const dto = { contenu: 'Bonjour' };
    const response = { id: 'message-1', ...dto };
    messageServiceMock.create.mockResolvedValue(response);

    await expect(controller.create(conversationId, dto, user)).resolves.toBe(
      response,
    );
    expect(messageServiceMock.create).toHaveBeenCalledWith(
      conversationId,
      dto,
      user.sub,
    );
  });

  it('délègue la recherche paginée des messages', async () => {
    const conversationId = '11111111-1111-4111-8111-111111111111';
    const user = { sub: 'user-1' };
    const response = { data: [], meta: {} };
    messageServiceMock.findAllByConversation.mockResolvedValue(response);

    await expect(controller.findAll(conversationId, 2, 10, user)).resolves.toBe(
      response,
    );
    expect(messageServiceMock.findAllByConversation).toHaveBeenCalledWith(
      conversationId,
      user.sub,
      2,
      10,
    );
  });

  it('délègue le marquage des messages comme lus', async () => {
    const conversationId = '11111111-1111-4111-8111-111111111111';
    const user = { sub: 'user-1' };
    const response = { count: 3 };
    messageServiceMock.markAsRead.mockResolvedValue(response);

    await expect(controller.markAsRead(conversationId, user)).resolves.toBe(
      response,
    );
    expect(messageServiceMock.markAsRead).toHaveBeenCalledWith(
      conversationId,
      user.sub,
    );
  });

  it('délègue la modification d’un message', async () => {
    const conversationId = '11111111-1111-4111-8111-111111111111';
    const messageId = '22222222-2222-4222-8222-222222222222';
    const user = { sub: 'user-1' };
    const dto = { contenu: 'Message modifié' };
    const response = { id: messageId, ...dto };
    messageServiceMock.update.mockResolvedValue(response);

    await expect(
      controller.update(conversationId, messageId, dto, user),
    ).resolves.toBe(response);
    expect(messageServiceMock.update).toHaveBeenCalledWith(
      messageId,
      dto,
      user.sub,
      conversationId,
    );
  });

  it('délègue la suppression d’un message', async () => {
    const conversationId = '11111111-1111-4111-8111-111111111111';
    const messageId = '22222222-2222-4222-8222-222222222222';
    const user = { sub: 'user-1' };
    const response = { id: messageId };
    messageServiceMock.remove.mockResolvedValue(response);

    await expect(
      controller.remove(conversationId, messageId, user),
    ).resolves.toBe(response);
    expect(messageServiceMock.remove).toHaveBeenCalledWith(
      messageId,
      user.sub,
      conversationId,
    );
  });
});
