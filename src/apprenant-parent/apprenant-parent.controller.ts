import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApprenantParentService } from './apprenant-parent.service';
import { CreateApprenantParentDto } from './dto/create-apprenant-parent.dto';
import { UpdateApprenantParentDto } from './dto/update-apprenant-parent.dto';

@Controller('apprenant-parent')
export class ApprenantParentController {
  constructor(private readonly apprenantParentService: ApprenantParentService) {}

  @Post()
  create(@Body() createApprenantParentDto: CreateApprenantParentDto) {
    return this.apprenantParentService.create(createApprenantParentDto);
  }

  @Get()
  findAll() {
    return this.apprenantParentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.apprenantParentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateApprenantParentDto: UpdateApprenantParentDto) {
    return this.apprenantParentService.update(+id, updateApprenantParentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.apprenantParentService.remove(+id);
  }
}
