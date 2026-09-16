import { PartialType } from '@nestjs/mapped-types';
import { CreatePaiementDto } from './paiement.dto';

export class UpdatePaiementDto extends PartialType(CreatePaiementDto) {}
