import { Injectable } from '@nestjs/common';
import { CreatePeriodeScolaireDto } from './dto/create-periode-scolaire.dto';
import { UpdatePeriodeScolaireDto } from './dto/update-periode-scolaire.dto';

@Injectable()
export class PeriodeScolaireService {
  create(createPeriodeScolaireDto: CreatePeriodeScolaireDto) {
    return 'This action adds a new periodeScolaire';
  }

  findAll() {
    return `This action returns all periodeScolaire`;
  }

  findOne(id: number) {
    return `This action returns a #${id} periodeScolaire`;
  }

  update(id: number, updatePeriodeScolaireDto: UpdatePeriodeScolaireDto) {
    return `This action updates a #${id} periodeScolaire`;
  }

  remove(id: number) {
    return `This action removes a #${id} periodeScolaire`;
  }
}
