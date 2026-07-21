import { PartialType } from '@nestjs/mapped-types';
import { CreateApprenantParentDto } from './create-apprenant-parent.dto';

export class UpdateApprenantParentDto extends PartialType(CreateApprenantParentDto) {}
