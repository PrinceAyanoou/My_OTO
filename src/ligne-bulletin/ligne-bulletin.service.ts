import { Injectable } from '@nestjs/common';
import { CreateLigneBulletinDto } from './dto/create-ligne-bulletin.dto';
import { UpdateLigneBulletinDto } from './dto/update-ligne-bulletin.dto';

@Injectable()
export class LigneBulletinService {
  create(createLigneBulletinDto: CreateLigneBulletinDto) {
    return 'This action adds a new ligneBulletin';
  }

  findAll() {
    return `This action returns all ligneBulletin`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ligneBulletin`;
  }

  update(id: number, updateLigneBulletinDto: UpdateLigneBulletinDto) {
    return `This action updates a #${id} ligneBulletin`;
  }

  remove(id: number) {
    return `This action removes a #${id} ligneBulletin`;
  }
}
