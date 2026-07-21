import { Injectable } from '@nestjs/common';
import { CreateNiveauScolaireDto } from './dto/create-niveau-scolaire.dto';
import { UpdateNiveauScolaireDto } from './dto/update-niveau-scolaire.dto';

@Injectable()
export class NiveauScolaireService {
  create(createNiveauScolaireDto: CreateNiveauScolaireDto) {
    return 'This action adds a new niveauScolaire';
  }

  findAll() {
    return `This action returns all niveauScolaire`;
  }

  findOne(id: number) {
    return `This action returns a #${id} niveauScolaire`;
  }

  update(id: number, updateNiveauScolaireDto: UpdateNiveauScolaireDto) {
    return `This action updates a #${id} niveauScolaire`;
  }

  remove(id: number) {
    return `This action removes a #${id} niveauScolaire`;
  }
}
