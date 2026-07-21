import { Injectable } from '@nestjs/common';
import { CreateBulletinDto } from './dto/create-bulletin.dto';
import { UpdateBulletinDto } from './dto/update-bulletin.dto';

@Injectable()
export class BulletinService {
  create(createBulletinDto: CreateBulletinDto) {
    return 'This action adds a new bulletin';
  }

  findAll() {
    return `This action returns all bulletin`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bulletin`;
  }

  update(id: number, updateBulletinDto: UpdateBulletinDto) {
    return `This action updates a #${id} bulletin`;
  }

  remove(id: number) {
    return `This action removes a #${id} bulletin`;
  }
}
