import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClasseMatirereService } from './classe-matirere.service';
import { CreateClasseMatirereDto } from './dto/create-classe-matirere.dto';
import { UpdateClasseMatirereDto } from './dto/update-classe-matirere.dto';

@Controller('classe-matirere')
export class ClasseMatirereController {
  constructor(private readonly classeMatirereService: ClasseMatirereService) {}

  @Post()
  create(@Body() createClasseMatirereDto: CreateClasseMatirereDto) {
    return this.classeMatirereService.create(createClasseMatirereDto);
  }

  @Get()
  findAll() {
    return this.classeMatirereService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classeMatirereService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClasseMatirereDto: UpdateClasseMatirereDto) {
    return this.classeMatirereService.update(+id, updateClasseMatirereDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classeMatirereService.remove(+id);
  }
}
