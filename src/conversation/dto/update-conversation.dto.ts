import { PartialType } from '@nestjs/mapped-types';
import { CreateConversationDto } from './conversation.dto';

export class UpdateConversationDto extends PartialType(CreateConversationDto) {}
