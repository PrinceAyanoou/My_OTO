import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TypeEvaluationService } from './type-evaluation.service';
import { CreateTypeEvaluationDto } from './dto/create-type-evaluation.dto';
import { UpdateTypeEvaluationDto } from './dto/update-type-evaluation.dto';

@Controller('type-evaluation')
export class TypeEvaluationController {
  constructor(private readonly typeEvaluationService: TypeEvaluationService) {}

  @Post()
  create(@Body() createTypeEvaluationDto: CreateTypeEvaluationDto) {
    return this.typeEvaluationService.create(createTypeEvaluationDto);
  }

  @Get()
  findAll() {
    return this.typeEvaluationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.typeEvaluationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTypeEvaluationDto: UpdateTypeEvaluationDto) {
    return this.typeEvaluationService.update(+id, updateTypeEvaluationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.typeEvaluationService.remove(+id);
  }
}
