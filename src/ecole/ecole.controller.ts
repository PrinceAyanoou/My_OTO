import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EcoleService } from './ecole.service';
import { CreateEcoleDto } from './dto/create-ecole.dto';
import { UpdateEcoleDto } from './dto/update-ecole.dto';

@Controller('ecole')
export class EcoleController {
  constructor(private readonly ecoleService: EcoleService) {}

  @Post()
  create(@Body() createEcoleDto: CreateEcoleDto) {
    return this.ecoleService.create(createEcoleDto);
  }

  @Get()
  findAll() {
    return this.ecoleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ecoleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEcoleDto: UpdateEcoleDto) {
    return this.ecoleService.update(+id, updateEcoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ecoleService.remove(+id);
  }
}
