import { Injectable } from '@nestjs/common';
import { CreateAffectationEnseignantDto } from './dto/create-affectation-enseignant.dto';
import { UpdateAffectationEnseignantDto } from './dto/update-affectation-enseignant.dto';

@Injectable()
export class AffectationEnseignantService {
  create(createAffectationEnseignantDto: CreateAffectationEnseignantDto) {
    return 'This action adds a new affectationEnseignant';
  }

  findAll() {
    return `This action returns all affectationEnseignant`;
  }

  findOne(id: number) {
    return `This action returns a #${id} affectationEnseignant`;
  }

  update(id: number, updateAffectationEnseignantDto: UpdateAffectationEnseignantDto) {
    return `This action updates a #${id} affectationEnseignant`;
  }

  remove(id: number) {
    return `This action removes a #${id} affectationEnseignant`;
  }
}
