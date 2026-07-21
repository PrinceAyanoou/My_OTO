import { PartialType } from '@nestjs/mapped-types';
import { CreateEmploiDuTempDto } from './create-emploi-du-temp.dto';

export class UpdateEmploiDuTempDto extends PartialType(CreateEmploiDuTempDto) {}
