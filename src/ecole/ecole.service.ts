import { Injectable } from '@nestjs/common';
import { CreateEcoleDto } from './dto/create-ecole.dto';
import { UpdateEcoleDto } from './dto/update-ecole.dto';

@Injectable()
export class EcoleService {
  create(createEcoleDto: CreateEcoleDto) {
    return 'This action adds a new ecole';
  }

  findAll() {
    return `This action returns all ecole`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ecole`;
  }

  update(id: number, updateEcoleDto: UpdateEcoleDto) {
    return `This action updates a #${id} ecole`;
  }

  remove(id: number) {
    return `This action removes a #${id} ecole`;
  }
}
