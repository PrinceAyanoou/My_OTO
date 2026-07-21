import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RegleEvaluationService } from './regle-evaluation.service';
import { CreateRegleEvaluationDto } from './dto/create-regle-evaluation.dto';
import { UpdateRegleEvaluationDto } from './dto/update-regle-evaluation.dto';

@Controller('regle-evaluation')
export class RegleEvaluationController {
  constructor(private readonly regleEvaluationService: RegleEvaluationService) {}

  @Post()
  create(@Body() createRegleEvaluationDto: CreateRegleEvaluationDto) {
    return this.regleEvaluationService.create(createRegleEvaluationDto);
  }

  @Get()
  findAll() {
    return this.regleEvaluationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.regleEvaluationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRegleEvaluationDto: UpdateRegleEvaluationDto) {
    return this.regleEvaluationService.update(+id, updateRegleEvaluationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.regleEvaluationService.remove(+id);
  }
}
