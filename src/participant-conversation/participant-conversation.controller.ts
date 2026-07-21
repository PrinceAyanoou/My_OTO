import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParticipantConversationService } from './participant-conversation.service';
import { CreateParticipantConversationDto } from './dto/create-participant-conversation.dto';
import { UpdateParticipantConversationDto } from './dto/update-participant-conversation.dto';

@Controller('participant-conversation')
export class ParticipantConversationController {
  constructor(private readonly participantConversationService: ParticipantConversationService) {}

  @Post()
  create(@Body() createParticipantConversationDto: CreateParticipantConversationDto) {
    return this.participantConversationService.create(createParticipantConversationDto);
  }

  @Get()
  findAll() {
    return this.participantConversationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.participantConversationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateParticipantConversationDto: UpdateParticipantConversationDto) {
    return this.participantConversationService.update(+id, updateParticipantConversationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.participantConversationService.remove(+id);
  }
}
