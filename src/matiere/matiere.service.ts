import { Injectable } from '@nestjs/common';
import { CreateMatiereDto } from './dto/create-matiere.dto';
import { UpdateMatiereDto } from './dto/update-matiere.dto';

@Injectable()
export class MatiereService {
  create(createMatiereDto: CreateMatiereDto) {
    return 'This action adds a new matiere';
  }

  findAll() {
    return `This action returns all matiere`;
  }

  findOne(id: number) {
    return `This action returns a #${id} matiere`;
  }

  update(id: number, updateMatiereDto: UpdateMatiereDto) {
    return `This action updates a #${id} matiere`;
  }

  remove(id: number) {
    return `This action removes a #${id} matiere`;
  }
}
