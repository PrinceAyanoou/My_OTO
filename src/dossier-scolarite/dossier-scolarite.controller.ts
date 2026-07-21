import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DossierScolariteService } from './dossier-scolarite.service';
import { CreateDossierScolariteDto } from './dto/create-dossier-scolarite.dto';
import { UpdateDossierScolariteDto } from './dto/update-dossier-scolarite.dto';

@Controller('dossier-scolarite')
export class DossierScolariteController {
  constructor(private readonly dossierScolariteService: DossierScolariteService) {}

  @Post()
  create(@Body() createDossierScolariteDto: CreateDossierScolariteDto) {
    return this.dossierScolariteService.create(createDossierScolariteDto);
  }

  @Get()
  findAll() {
    return this.dossierScolariteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dossierScolariteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDossierScolariteDto: UpdateDossierScolariteDto) {
    return this.dossierScolariteService.update(+id, updateDossierScolariteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dossierScolariteService.remove(+id);
  }
}
