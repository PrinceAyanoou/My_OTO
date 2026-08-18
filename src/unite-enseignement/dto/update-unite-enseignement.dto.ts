import { PartialType } from '@nestjs/mapped-types';
import { CreateUniteEnseignementDto } from './unite-enseignement.dto';

export class UpdateUniteEnseignementDto extends PartialType(CreateUniteEnseignementDto) {}
