import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LigneBulletinService } from './ligne-bulletin.service';
import { CreateLigneBulletinDto } from './dto/create-ligne-bulletin.dto';
import { UpdateLigneBulletinDto } from './dto/update-ligne-bulletin.dto';

@Controller('ligne-bulletin')
export class LigneBulletinController {
  constructor(private readonly ligneBulletinService: LigneBulletinService) {}

  @Post()
  create(@Body() createLigneBulletinDto: CreateLigneBulletinDto) {
    return this.ligneBulletinService.create(createLigneBulletinDto);
  }

  @Get()
  findAll() {
    return this.ligneBulletinService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ligneBulletinService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLigneBulletinDto: UpdateLigneBulletinDto) {
    return this.ligneBulletinService.update(+id, updateLigneBulletinDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ligneBulletinService.remove(+id);
  }
}
