import { Injectable } from '@nestjs/common';
import { CreateAnneeScolaireDto } from './dto/create-annee-scolaire.dto';
import { UpdateAnneeScolaireDto } from './dto/update-annee-scolaire.dto';

@Injectable()
export class AnneeScolaireService {
  create(createAnneeScolaireDto: CreateAnneeScolaireDto) {
    return 'This action adds a new anneeScolaire';
  }

  findAll() {
    return `This action returns all anneeScolaire`;
  }

  findOne(id: number) {
    return `This action returns a #${id} anneeScolaire`;
  }

  update(id: number, updateAnneeScolaireDto: UpdateAnneeScolaireDto) {
    return `This action updates a #${id} anneeScolaire`;
  }

  remove(id: number) {
    return `This action removes a #${id} anneeScolaire`;
  }
}
