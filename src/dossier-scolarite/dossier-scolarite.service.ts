import { Injectable } from '@nestjs/common';
import { CreateDossierScolariteDto } from './dto/create-dossier-scolarite.dto';
import { UpdateDossierScolariteDto } from './dto/update-dossier-scolarite.dto';

@Injectable()
export class DossierScolariteService {
  create(createDossierScolariteDto: CreateDossierScolariteDto) {
    return 'This action adds a new dossierScolarite';
  }

  findAll() {
    return `This action returns all dossierScolarite`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dossierScolarite`;
  }

  update(id: number, updateDossierScolariteDto: UpdateDossierScolariteDto) {
    return `This action updates a #${id} dossierScolarite`;
  }

  remove(id: number) {
    return `This action removes a #${id} dossierScolarite`;
  }
}
