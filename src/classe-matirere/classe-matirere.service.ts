import { Injectable } from '@nestjs/common';
import { CreateClasseMatirereDto } from './dto/create-classe-matirere.dto';
import { UpdateClasseMatirereDto } from './dto/update-classe-matirere.dto';

@Injectable()
export class ClasseMatirereService {
  create(createClasseMatirereDto: CreateClasseMatirereDto) {
    return 'This action adds a new classeMatirere';
  }

  findAll() {
    return `This action returns all classeMatirere`;
  }

  findOne(id: number) {
    return `This action returns a #${id} classeMatirere`;
  }

  update(id: number, updateClasseMatirereDto: UpdateClasseMatirereDto) {
    return `This action updates a #${id} classeMatirere`;
  }

  remove(id: number) {
    return `This action removes a #${id} classeMatirere`;
  }
}
