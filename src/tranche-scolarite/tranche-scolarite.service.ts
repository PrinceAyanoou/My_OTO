import { Injectable } from '@nestjs/common';
import { CreateTrancheScolariteDto } from './dto/create-tranche-scolarite.dto';
import { UpdateTrancheScolariteDto } from './dto/update-tranche-scolarite.dto';

@Injectable()
export class TrancheScolariteService {
  create(createTrancheScolariteDto: CreateTrancheScolariteDto) {
    return 'This action adds a new trancheScolarite';
  }

  findAll() {
    return `This action returns all trancheScolarite`;
  }

  findOne(id: number) {
    return `This action returns a #${id} trancheScolarite`;
  }

  update(id: number, updateTrancheScolariteDto: UpdateTrancheScolariteDto) {
    return `This action updates a #${id} trancheScolarite`;
  }

  remove(id: number) {
    return `This action removes a #${id} trancheScolarite`;
  }
}
