import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DecisionFinAnneeService } from './decision-fin-annee.service';
import { CreateDecisionFinAnneeDto } from './dto/create-decision-fin-annee.dto';
import { UpdateDecisionFinAnneeDto } from './dto/update-decision-fin-annee.dto';

@Controller('decision-fin-annee')
export class DecisionFinAnneeController {
  constructor(private readonly decisionFinAnneeService: DecisionFinAnneeService) {}

  @Post()
  create(@Body() createDecisionFinAnneeDto: CreateDecisionFinAnneeDto) {
    return this.decisionFinAnneeService.create(createDecisionFinAnneeDto);
  }

  @Get()
  findAll() {
    return this.decisionFinAnneeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.decisionFinAnneeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDecisionFinAnneeDto: UpdateDecisionFinAnneeDto) {
    return this.decisionFinAnneeService.update(+id, updateDecisionFinAnneeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.decisionFinAnneeService.remove(+id);
  }
}
