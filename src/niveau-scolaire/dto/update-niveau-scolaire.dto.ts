import { PartialType } from '@nestjs/mapped-types';
import { CreateNiveauScolaireDto } from './niveau-scolaire.dto';

export class UpdateNiveauScolaireDto extends PartialType(CreateNiveauScolaireDto) {}
