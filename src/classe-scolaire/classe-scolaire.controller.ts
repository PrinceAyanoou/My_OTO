import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClasseScolaireService } from './classe-scolaire.service';
import { CreateClasseScolaireDto } from './dto/create-classe-scolaire.dto';
import { UpdateClasseScolaireDto } from './dto/update-classe-scolaire.dto';

@Controller('classe-scolaire')
export class ClasseScolaireController {
  constructor(private readonly classeScolaireService: ClasseScolaireService) {}

  @Post()
  create(@Body() createClasseScolaireDto: CreateClasseScolaireDto) {
    return this.classeScolaireService.create(createClasseScolaireDto);
  }

  @Get()
  findAll() {
    return this.classeScolaireService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classeScolaireService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClasseScolaireDto: UpdateClasseScolaireDto) {
    return this.classeScolaireService.update(+id, updateClasseScolaireDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classeScolaireService.remove(+id);
  }
}
