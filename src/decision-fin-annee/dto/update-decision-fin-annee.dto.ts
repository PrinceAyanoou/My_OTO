import { PartialType } from '@nestjs/mapped-types';
import { CreateDecisionFinAnneeDto } from './create-decision-fin-annee.dto';

export class UpdateDecisionFinAnneeDto extends PartialType(CreateDecisionFinAnneeDto) {}
