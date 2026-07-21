import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmployeDocumentService } from './employe-document.service';
import { CreateEmployeDocumentDto } from './dto/create-employe-document.dto';
import { UpdateEmployeDocumentDto } from './dto/update-employe-document.dto';

@Controller('employe-document')
export class EmployeDocumentController {
  constructor(private readonly employeDocumentService: EmployeDocumentService) {}

  @Post()
  create(@Body() createEmployeDocumentDto: CreateEmployeDocumentDto) {
    return this.employeDocumentService.create(createEmployeDocumentDto);
  }

  @Get()
  findAll() {
    return this.employeDocumentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeDocumentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmployeDocumentDto: UpdateEmployeDocumentDto) {
    return this.employeDocumentService.update(+id, updateEmployeDocumentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeDocumentService.remove(+id);
  }
}
