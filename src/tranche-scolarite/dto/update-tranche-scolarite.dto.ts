import { PartialType } from '@nestjs/mapped-types';
import { CreateTrancheScolariteDto } from './create-tranche-scolarite.dto';

export class UpdateTrancheScolariteDto extends PartialType(CreateTrancheScolariteDto) {}
