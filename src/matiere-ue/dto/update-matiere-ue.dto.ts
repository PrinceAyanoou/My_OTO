import { PartialType } from '@nestjs/mapped-types';
import { CreateMatiereUeDto } from './create-matiere-ue.dto';

export class UpdateMatiereUeDto extends PartialType(CreateMatiereUeDto) {}
