import { PartialType } from '@nestjs/mapped-types';
import { CreateAffectationEnseignantDto } from './create-affectation-enseignant.dto';

export class UpdateAffectationEnseignantDto extends PartialType(CreateAffectationEnseignantDto) {}
