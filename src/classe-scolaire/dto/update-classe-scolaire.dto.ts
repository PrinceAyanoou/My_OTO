import { PartialType } from '@nestjs/mapped-types';
import { CreateClasseScolaireDto } from './create-classe-scolaire.dto';

export class UpdateClasseScolaireDto extends PartialType(CreateClasseScolaireDto) {}
