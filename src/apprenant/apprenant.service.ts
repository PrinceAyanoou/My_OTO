import { Injectable } from '@nestjs/common';
import { CreateApprenantDto } from './dto/create-apprenant.dto';
import { UpdateApprenantDto } from './dto/update-apprenant.dto';

@Injectable()
export class ApprenantService {
  create(createApprenantDto: CreateApprenantDto) {
    return 'This action adds a new apprenant';
  }

  findAll() {
    return `This action returns all apprenant`;
  }

  findOne(id: number) {
    return `This action returns a #${id} apprenant`;
  }

  update(id: number, updateApprenantDto: UpdateApprenantDto) {
    return `This action updates a #${id} apprenant`;
  }

  remove(id: number) {
    return `This action removes a #${id} apprenant`;
  }
}
