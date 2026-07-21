import { Injectable } from '@nestjs/common';
import { CreateCibleAnnonceDto } from './dto/create-cible-annonce.dto';
import { UpdateCibleAnnonceDto } from './dto/update-cible-annonce.dto';

@Injectable()
export class CibleAnnonceService {
  create(createCibleAnnonceDto: CreateCibleAnnonceDto) {
    return 'This action adds a new cibleAnnonce';
  }

  findAll() {
    return `This action returns all cibleAnnonce`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cibleAnnonce`;
  }

  update(id: number, updateCibleAnnonceDto: UpdateCibleAnnonceDto) {
    return `This action updates a #${id} cibleAnnonce`;
  }

  remove(id: number) {
    return `This action removes a #${id} cibleAnnonce`;
  }
}
