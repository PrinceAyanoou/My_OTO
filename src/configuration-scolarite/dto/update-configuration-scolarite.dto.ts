import { PartialType } from '@nestjs/mapped-types';
import { CreateConfigurationScolariteDto } from './create-configuration-scolarite.dto';

export class UpdateConfigurationScolariteDto extends PartialType(CreateConfigurationScolariteDto) {}
