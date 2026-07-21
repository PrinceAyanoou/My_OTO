import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UniteEnseignementService } from './unite-enseignement.service';
import { CreateUniteEnseignementDto } from './dto/create-unite-enseignement.dto';
import { UpdateUniteEnseignementDto } from './dto/update-unite-enseignement.dto';

@Controller('unite-enseignement')
export class UniteEnseignementController {
  constructor(private readonly uniteEnseignementService: UniteEnseignementService) {}

  @Post()
  create(@Body() createUniteEnseignementDto: CreateUniteEnseignementDto) {
    return this.uniteEnseignementService.create(createUniteEnseignementDto);
  }

  @Get()
  findAll() {
    return this.uniteEnseignementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.uniteEnseignementService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUniteEnseignementDto: UpdateUniteEnseignementDto) {
    return this.uniteEnseignementService.update(+id, updateUniteEnseignementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.uniteEnseignementService.remove(+id);
  }
}
