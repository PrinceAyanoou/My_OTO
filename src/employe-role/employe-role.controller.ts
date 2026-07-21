import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmployeRoleService } from './employe-role.service';
import { CreateEmployeRoleDto } from './dto/create-employe-role.dto';
import { UpdateEmployeRoleDto } from './dto/update-employe-role.dto';

@Controller('employe-role')
export class EmployeRoleController {
  constructor(private readonly employeRoleService: EmployeRoleService) {}

  @Post()
  create(@Body() createEmployeRoleDto: CreateEmployeRoleDto) {
    return this.employeRoleService.create(createEmployeRoleDto);
  }

  @Get()
  findAll() {
    return this.employeRoleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeRoleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmployeRoleDto: UpdateEmployeRoleDto) {
    return this.employeRoleService.update(+id, updateEmployeRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeRoleService.remove(+id);
  }
}
