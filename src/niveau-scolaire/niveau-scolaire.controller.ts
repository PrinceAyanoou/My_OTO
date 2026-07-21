import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NiveauScolaireService } from './niveau-scolaire.service';
import { CreateNiveauScolaireDto } from './dto/create-niveau-scolaire.dto';
import { UpdateNiveauScolaireDto } from './dto/update-niveau-scolaire.dto';

@Controller('niveau-scolaire')
export class NiveauScolaireController {
  constructor(private readonly niveauScolaireService: NiveauScolaireService) {}

  @Post()
  create(@Body() createNiveauScolaireDto: CreateNiveauScolaireDto) {
    return this.niveauScolaireService.create(createNiveauScolaireDto);
  }

  @Get()
  findAll() {
    return this.niveauScolaireService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.niveauScolaireService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNiveauScolaireDto: UpdateNiveauScolaireDto) {
    return this.niveauScolaireService.update(+id, updateNiveauScolaireDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.niveauScolaireService.remove(+id);
  }
}
