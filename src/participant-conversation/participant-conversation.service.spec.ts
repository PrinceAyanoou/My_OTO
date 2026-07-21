import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantConversationService } from './participant-conversation.service';

describe('ParticipantConversationService', () => {
  let service: ParticipantConversationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParticipantConversationService],
    }).compile();

    service = module.get<ParticipantConversationService>(ParticipantConversationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
