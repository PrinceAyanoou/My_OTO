import { PartialType } from '@nestjs/mapped-types';
import { CreateCibleAnnonceDto } from './create-cible-annonce.dto';

export class UpdateCibleAnnonceDto extends PartialType(CreateCibleAnnonceDto) {}
