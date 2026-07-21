import { PartialType } from '@nestjs/mapped-types';
import { CreateNiveauScolaireDto } from './create-niveau-scolaire.dto';

export class UpdateNiveauScolaireDto extends PartialType(CreateNiveauScolaireDto) {}
