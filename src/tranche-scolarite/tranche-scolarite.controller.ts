import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TrancheScolariteService } from './tranche-scolarite.service';
import { CreateTrancheScolariteDto } from './dto/create-tranche-scolarite.dto';
import { UpdateTrancheScolariteDto } from './dto/update-tranche-scolarite.dto';

@Controller('tranche-scolarite')
export class TrancheScolariteController {
  constructor(private readonly trancheScolariteService: TrancheScolariteService) {}

  @Post()
  create(@Body() createTrancheScolariteDto: CreateTrancheScolariteDto) {
    return this.trancheScolariteService.create(createTrancheScolariteDto);
  }

  @Get()
  findAll() {
    return this.trancheScolariteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trancheScolariteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTrancheScolariteDto: UpdateTrancheScolariteDto) {
    return this.trancheScolariteService.update(+id, updateTrancheScolariteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trancheScolariteService.remove(+id);
  }
}
