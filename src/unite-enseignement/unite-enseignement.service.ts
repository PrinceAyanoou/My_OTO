import { Injectable } from '@nestjs/common';
import { CreateUniteEnseignementDto } from './dto/create-unite-enseignement.dto';
import { UpdateUniteEnseignementDto } from './dto/update-unite-enseignement.dto';

@Injectable()
export class UniteEnseignementService {
  create(createUniteEnseignementDto: CreateUniteEnseignementDto) {
    return 'This action adds a new uniteEnseignement';
  }

  findAll() {
    return `This action returns all uniteEnseignement`;
  }

  findOne(id: number) {
    return `This action returns a #${id} uniteEnseignement`;
  }

  update(id: number, updateUniteEnseignementDto: UpdateUniteEnseignementDto) {
    return `This action updates a #${id} uniteEnseignement`;
  }

  remove(id: number) {
    return `This action removes a #${id} uniteEnseignement`;
  }
}
