import { Injectable } from '@nestjs/common';
import { CreateParticipantConversationDto } from './dto/create-participant-conversation.dto';
import { UpdateParticipantConversationDto } from './dto/update-participant-conversation.dto';

@Injectable()
export class ParticipantConversationService {
  create(createParticipantConversationDto: CreateParticipantConversationDto) {
    return 'This action adds a new participantConversation';
  }

  findAll() {
    return `This action returns all participantConversation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} participantConversation`;
  }

  update(id: number, updateParticipantConversationDto: UpdateParticipantConversationDto) {
    return `This action updates a #${id} participantConversation`;
  }

  remove(id: number) {
    return `This action removes a #${id} participantConversation`;
  }
}
