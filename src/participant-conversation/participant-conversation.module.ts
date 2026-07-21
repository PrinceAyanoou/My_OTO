import { Module } from '@nestjs/common';
import { ParticipantConversationService } from './participant-conversation.service';
import { ParticipantConversationController } from './participant-conversation.controller';

@Module({
  controllers: [ParticipantConversationController],
  providers: [ParticipantConversationService],
})
export class ParticipantConversationModule {}
