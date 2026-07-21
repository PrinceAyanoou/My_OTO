import { PartialType } from '@nestjs/mapped-types';
import { CreateUniteEnseignementDto } from './create-unite-enseignement.dto';

export class UpdateUniteEnseignementDto extends PartialType(CreateUniteEnseignementDto) {}
