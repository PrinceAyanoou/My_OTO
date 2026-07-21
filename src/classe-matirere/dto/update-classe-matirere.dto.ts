import { PartialType } from '@nestjs/mapped-types';
import { CreateClasseMatirereDto } from './create-classe-matirere.dto';

export class UpdateClasseMatirereDto extends PartialType(CreateClasseMatirereDto) {}
