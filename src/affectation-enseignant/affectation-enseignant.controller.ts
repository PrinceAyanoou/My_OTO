import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AffectationEnseignantService } from './affectation-enseignant.service';
import { CreateAffectationEnseignantDto } from './dto/create-affectation-enseignant.dto';
import { UpdateAffectationEnseignantDto } from './dto/update-affectation-enseignant.dto';

@Controller('affectation-enseignant')
export class AffectationEnseignantController {
  constructor(private readonly affectationEnseignantService: AffectationEnseignantService) {}

  @Post()
  create(@Body() createAffectationEnseignantDto: CreateAffectationEnseignantDto) {
    return this.affectationEnseignantService.create(createAffectationEnseignantDto);
  }

  @Get()
  findAll() {
    return this.affectationEnseignantService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.affectationEnseignantService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAffectationEnseignantDto: UpdateAffectationEnseignantDto) {
    return this.affectationEnseignantService.update(+id, updateAffectationEnseignantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.affectationEnseignantService.remove(+id);
  }
}
