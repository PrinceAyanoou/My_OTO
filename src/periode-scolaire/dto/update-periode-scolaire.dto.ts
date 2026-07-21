import { PartialType } from '@nestjs/mapped-types';
import { CreatePeriodeScolaireDto } from './create-periode-scolaire.dto';

export class UpdatePeriodeScolaireDto extends PartialType(CreatePeriodeScolaireDto) {}
