import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantConversationController } from './participant-conversation.controller';
import { ParticipantConversationService } from './participant-conversation.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';

describe('ParticipantConversationController', () => {
  let controller: ParticipantConversationController;

  const participantServiceMock = {
    findAllByConversation: jest.fn(),
    addParticipants: jest.fn(),
    updateRole: jest.fn(),
    removeParticipant: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipantConversationController],
      providers: [
        {
          provide: ParticipantConversationService,
          useValue: participantServiceMock,
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<ParticipantConversationController>(
      ParticipantConversationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue les opérations participants', async () => {
    const conversationId = '11111111-1111-4111-8111-111111111111';
    const userId = '22222222-2222-4222-8222-222222222222';
    const user = { sub: userId };
    const dto = { userIds: [userId], role: 'MEMBRE' };
    const response = { id: 'participant-1' };
    participantServiceMock.findAllByConversation.mockResolvedValue(response);
    participantServiceMock.addParticipants.mockResolvedValue(response);
    participantServiceMock.updateRole.mockResolvedValue(response);
    participantServiceMock.removeParticipant.mockResolvedValue(response);

    await expect(controller.findAll(conversationId, user)).resolves.toBe(
      response,
    );
    await expect(
      controller.addParticipants(conversationId, dto as never, user),
    ).resolves.toBe(response);
    await expect(
      controller.updateRole(conversationId, userId, dto as never, user),
    ).resolves.toBe(response);
    await expect(
      controller.removeParticipant(conversationId, userId, user),
    ).resolves.toBe(response);
    expect(participantServiceMock.findAllByConversation).toHaveBeenCalledWith(
      conversationId,
      userId,
    );
    expect(participantServiceMock.removeParticipant).toHaveBeenCalledWith(
      conversationId,
      userId,
      userId,
    );
  });
});
