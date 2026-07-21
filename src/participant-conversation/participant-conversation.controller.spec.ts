import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantConversationController } from './participant-conversation.controller';
import { ParticipantConversationService } from './participant-conversation.service';

describe('ParticipantConversationController', () => {
  let controller: ParticipantConversationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipantConversationController],
      providers: [ParticipantConversationService],
    }).compile();

    controller = module.get<ParticipantConversationController>(ParticipantConversationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
