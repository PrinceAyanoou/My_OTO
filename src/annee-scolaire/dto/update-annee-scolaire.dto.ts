import { PartialType } from '@nestjs/mapped-types';
import { CreateAnneeScolaireDto } from './annee-scolaire.dto';

export class UpdateAnneeScolaireDto extends PartialType(CreateAnneeScolaireDto) {}
