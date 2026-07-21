import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConfigurationScolariteService } from './configuration-scolarite.service';
import { CreateConfigurationScolariteDto } from './dto/create-configuration-scolarite.dto';
import { UpdateConfigurationScolariteDto } from './dto/update-configuration-scolarite.dto';

@Controller('configuration-scolarite')
export class ConfigurationScolariteController {
  constructor(private readonly configurationScolariteService: ConfigurationScolariteService) {}

  @Post()
  create(@Body() createConfigurationScolariteDto: CreateConfigurationScolariteDto) {
    return this.configurationScolariteService.create(createConfigurationScolariteDto);
  }

  @Get()
  findAll() {
    return this.configurationScolariteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.configurationScolariteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConfigurationScolariteDto: UpdateConfigurationScolariteDto) {
    return this.configurationScolariteService.update(+id, updateConfigurationScolariteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.configurationScolariteService.remove(+id);
  }
}
