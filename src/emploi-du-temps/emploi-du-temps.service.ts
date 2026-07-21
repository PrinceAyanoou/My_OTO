import { Injectable } from '@nestjs/common';
import { CreateEmploiDuTempDto } from './dto/create-emploi-du-temp.dto';
import { UpdateEmploiDuTempDto } from './dto/update-emploi-du-temp.dto';

@Injectable()
export class EmploiDuTempsService {
  create(createEmploiDuTempDto: CreateEmploiDuTempDto) {
    return 'This action adds a new emploiDuTemp';
  }

  findAll() {
    return `This action returns all emploiDuTemps`;
  }

  findOne(id: number) {
    return `This action returns a #${id} emploiDuTemp`;
  }

  update(id: number, updateEmploiDuTempDto: UpdateEmploiDuTempDto) {
    return `This action updates a #${id} emploiDuTemp`;
  }

  remove(id: number) {
    return `This action removes a #${id} emploiDuTemp`;
  }
}
