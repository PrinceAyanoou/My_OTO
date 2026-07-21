import { Injectable } from '@nestjs/common';
import { CreateEmployeRoleDto } from './dto/create-employe-role.dto';
import { UpdateEmployeRoleDto } from './dto/update-employe-role.dto';

@Injectable()
export class EmployeRoleService {
  create(createEmployeRoleDto: CreateEmployeRoleDto) {
    return 'This action adds a new employeRole';
  }

  findAll() {
    return `This action returns all employeRole`;
  }

  findOne(id: number) {
    return `This action returns a #${id} employeRole`;
  }

  update(id: number, updateEmployeRoleDto: UpdateEmployeRoleDto) {
    return `This action updates a #${id} employeRole`;
  }

  remove(id: number) {
    return `This action removes a #${id} employeRole`;
  }
}
