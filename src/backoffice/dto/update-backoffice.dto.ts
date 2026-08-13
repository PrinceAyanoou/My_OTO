import { PartialType } from '@nestjs/swagger';
import { CreateBackofficeDto } from './create-backoffice.dto';

export class UpdateBackofficeDto extends PartialType(CreateBackofficeDto) {}
