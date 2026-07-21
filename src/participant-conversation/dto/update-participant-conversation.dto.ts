import { PartialType } from '@nestjs/mapped-types';
import { CreateParticipantConversationDto } from './create-participant-conversation.dto';

export class UpdateParticipantConversationDto extends PartialType(CreateParticipantConversationDto) {}
