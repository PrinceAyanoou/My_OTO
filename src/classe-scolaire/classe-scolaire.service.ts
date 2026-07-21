import { Injectable } from '@nestjs/common';
import { CreateClasseScolaireDto } from './dto/create-classe-scolaire.dto';
import { UpdateClasseScolaireDto } from './dto/update-classe-scolaire.dto';

@Injectable()
export class ClasseScolaireService {
  create(createClasseScolaireDto: CreateClasseScolaireDto) {
    return 'This action adds a new classeScolaire';
  }

  findAll() {
    return `This action returns all classeScolaire`;
  }

  findOne(id: number) {
    return `This action returns a #${id} classeScolaire`;
  }

  update(id: number, updateClasseScolaireDto: UpdateClasseScolaireDto) {
    return `This action updates a #${id} classeScolaire`;
  }

  remove(id: number) {
    return `This action removes a #${id} classeScolaire`;
  }
}
