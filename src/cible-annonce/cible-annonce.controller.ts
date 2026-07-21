import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CibleAnnonceService } from './cible-annonce.service';
import { CreateCibleAnnonceDto } from './dto/create-cible-annonce.dto';
import { UpdateCibleAnnonceDto } from './dto/update-cible-annonce.dto';

@Controller('cible-annonce')
export class CibleAnnonceController {
  constructor(private readonly cibleAnnonceService: CibleAnnonceService) {}

  @Post()
  create(@Body() createCibleAnnonceDto: CreateCibleAnnonceDto) {
    return this.cibleAnnonceService.create(createCibleAnnonceDto);
  }

  @Get()
  findAll() {
    return this.cibleAnnonceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cibleAnnonceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCibleAnnonceDto: UpdateCibleAnnonceDto) {
    return this.cibleAnnonceService.update(+id, updateCibleAnnonceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cibleAnnonceService.remove(+id);
  }
}
