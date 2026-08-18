import { PartialType } from '@nestjs/mapped-types';
import { CreateMatiereDto } from './matiere.dto';

export class UpdateMatiereDto extends PartialType(CreateMatiereDto) {}
