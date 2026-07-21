import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PeriodeScolaireService } from './periode-scolaire.service';
import { CreatePeriodeScolaireDto } from './dto/create-periode-scolaire.dto';
import { UpdatePeriodeScolaireDto } from './dto/update-periode-scolaire.dto';

@Controller('periode-scolaire')
export class PeriodeScolaireController {
  constructor(private readonly periodeScolaireService: PeriodeScolaireService) {}

  @Post()
  create(@Body() createPeriodeScolaireDto: CreatePeriodeScolaireDto) {
    return this.periodeScolaireService.create(createPeriodeScolaireDto);
  }

  @Get()
  findAll() {
    return this.periodeScolaireService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.periodeScolaireService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePeriodeScolaireDto: UpdatePeriodeScolaireDto) {
    return this.periodeScolaireService.update(+id, updatePeriodeScolaireDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.periodeScolaireService.remove(+id);
  }
}
