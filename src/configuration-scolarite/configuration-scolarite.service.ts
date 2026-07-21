import { Injectable } from '@nestjs/common';
import { CreateConfigurationScolariteDto } from './dto/create-configuration-scolarite.dto';
import { UpdateConfigurationScolariteDto } from './dto/update-configuration-scolarite.dto';

@Injectable()
export class ConfigurationScolariteService {
  create(createConfigurationScolariteDto: CreateConfigurationScolariteDto) {
    return 'This action adds a new configurationScolarite';
  }

  findAll() {
    return `This action returns all configurationScolarite`;
  }

  findOne(id: number) {
    return `This action returns a #${id} configurationScolarite`;
  }

  update(id: number, updateConfigurationScolariteDto: UpdateConfigurationScolariteDto) {
    return `This action updates a #${id} configurationScolarite`;
  }

  remove(id: number) {
    return `This action removes a #${id} configurationScolarite`;
  }
}
