import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmploiDuTempsService } from './emploi-du-temps.service';
import { CreateEmploiDuTempDto } from './dto/create-emploi-du-temp.dto';
import { UpdateEmploiDuTempDto } from './dto/update-emploi-du-temp.dto';

@Controller('emploi-du-temps')
export class EmploiDuTempsController {
  constructor(private readonly emploiDuTempsService: EmploiDuTempsService) {}

  @Post()
  create(@Body() createEmploiDuTempDto: CreateEmploiDuTempDto) {
    return this.emploiDuTempsService.create(createEmploiDuTempDto);
  }

  @Get()
  findAll() {
    return this.emploiDuTempsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emploiDuTempsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmploiDuTempDto: UpdateEmploiDuTempDto) {
    return this.emploiDuTempsService.update(+id, updateEmploiDuTempDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.emploiDuTempsService.remove(+id);
  }
}
