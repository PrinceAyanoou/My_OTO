import { Injectable } from '@nestjs/common';
import { CreateEmployeDocumentDto } from './dto/create-employe-document.dto';
import { UpdateEmployeDocumentDto } from './dto/update-employe-document.dto';

@Injectable()
export class EmployeDocumentService {
  create(createEmployeDocumentDto: CreateEmployeDocumentDto) {
    return 'This action adds a new employeDocument';
  }

  findAll() {
    return `This action returns all employeDocument`;
  }

  findOne(id: number) {
    return `This action returns a #${id} employeDocument`;
  }

  update(id: number, updateEmployeDocumentDto: UpdateEmployeDocumentDto) {
    return `This action updates a #${id} employeDocument`;
  }

  remove(id: number) {
    return `This action removes a #${id} employeDocument`;
  }
}
