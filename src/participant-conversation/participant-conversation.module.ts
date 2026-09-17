import { Module } from '@nestjs/common';
import { ParticipantConversationService } from './participant-conversation.service';
import { ParticipantConversationController } from './participant-conversation.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ParticipantConversationController],
  providers: [ParticipantConversationService, PrismaService],
})
export class ParticipantConversationModule {}
