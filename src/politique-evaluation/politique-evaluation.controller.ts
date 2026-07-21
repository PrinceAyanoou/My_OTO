import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PolitiqueEvaluationService } from './politique-evaluation.service';
import { CreatePolitiqueEvaluationDto } from './dto/create-politique-evaluation.dto';
import { UpdatePolitiqueEvaluationDto } from './dto/update-politique-evaluation.dto';

@Controller('politique-evaluation')
export class PolitiqueEvaluationController {
  constructor(private readonly politiqueEvaluationService: PolitiqueEvaluationService) {}

  @Post()
  create(@Body() createPolitiqueEvaluationDto: CreatePolitiqueEvaluationDto) {
    return this.politiqueEvaluationService.create(createPolitiqueEvaluationDto);
  }

  @Get()
  findAll() {
    return this.politiqueEvaluationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.politiqueEvaluationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePolitiqueEvaluationDto: UpdatePolitiqueEvaluationDto) {
    return this.politiqueEvaluationService.update(+id, updatePolitiqueEvaluationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.politiqueEvaluationService.remove(+id);
  }
}
