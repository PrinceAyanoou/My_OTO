import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MatiereUeService } from './matiere-ue.service';
import { CreateMatiereUeDto } from './dto/create-matiere-ue.dto';
import { UpdateMatiereUeDto } from './dto/update-matiere-ue.dto';

@Controller('matiere-ue')
export class MatiereUeController {
  constructor(private readonly matiereUeService: MatiereUeService) {}

  @Post()
  create(@Body() createMatiereUeDto: CreateMatiereUeDto) {
    return this.matiereUeService.create(createMatiereUeDto);
  }

  @Get()
  findAll() {
    return this.matiereUeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matiereUeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMatiereUeDto: UpdateMatiereUeDto) {
    return this.matiereUeService.update(+id, updateMatiereUeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.matiereUeService.remove(+id);
  }
}
