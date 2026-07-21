import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeRoleDto } from './create-employe-role.dto';

export class UpdateEmployeRoleDto extends PartialType(CreateEmployeRoleDto) {}
