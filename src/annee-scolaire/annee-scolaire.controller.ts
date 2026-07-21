import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AnneeScolaireService } from './annee-scolaire.service';
import { CreateAnneeScolaireDto } from './dto/create-annee-scolaire.dto';
import { UpdateAnneeScolaireDto } from './dto/update-annee-scolaire.dto';

@Controller('annee-scolaire')
export class AnneeScolaireController {
  constructor(private readonly anneeScolaireService: AnneeScolaireService) {}

  @Post()
  create(@Body() createAnneeScolaireDto: CreateAnneeScolaireDto) {
    return this.anneeScolaireService.create(createAnneeScolaireDto);
  }

  @Get()
  findAll() {
    return this.anneeScolaireService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.anneeScolaireService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAnneeScolaireDto: UpdateAnneeScolaireDto) {
    return this.anneeScolaireService.update(+id, updateAnneeScolaireDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.anneeScolaireService.remove(+id);
  }
}
