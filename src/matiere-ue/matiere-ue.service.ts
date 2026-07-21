import { Injectable } from '@nestjs/common';
import { CreateMatiereUeDto } from './dto/create-matiere-ue.dto';
import { UpdateMatiereUeDto } from './dto/update-matiere-ue.dto';

@Injectable()
export class MatiereUeService {
  create(createMatiereUeDto: CreateMatiereUeDto) {
    return 'This action adds a new matiereUe';
  }

  findAll() {
    return `This action returns all matiereUe`;
  }

  findOne(id: number) {
    return `This action returns a #${id} matiereUe`;
  }

  update(id: number, updateMatiereUeDto: UpdateMatiereUeDto) {
    return `This action updates a #${id} matiereUe`;
  }

  remove(id: number) {
    return `This action removes a #${id} matiereUe`;
  }
}
