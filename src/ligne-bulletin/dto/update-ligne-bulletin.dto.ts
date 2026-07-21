import { PartialType } from '@nestjs/mapped-types';
import { CreateLigneBulletinDto } from './create-ligne-bulletin.dto';

export class UpdateLigneBulletinDto extends PartialType(CreateLigneBulletinDto) {}
