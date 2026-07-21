import { Injectable } from '@nestjs/common';
import { CreateApprenantParentDto } from './dto/create-apprenant-parent.dto';
import { UpdateApprenantParentDto } from './dto/update-apprenant-parent.dto';

@Injectable()
export class ApprenantParentService {
  create(createApprenantParentDto: CreateApprenantParentDto) {
    return 'This action adds a new apprenantParent';
  }

  findAll() {
    return `This action returns all apprenantParent`;
  }

  findOne(id: number) {
    return `This action returns a #${id} apprenantParent`;
  }

  update(id: number, updateApprenantParentDto: UpdateApprenantParentDto) {
    return `This action updates a #${id} apprenantParent`;
  }

  remove(id: number) {
    return `This action removes a #${id} apprenantParent`;
  }
}
