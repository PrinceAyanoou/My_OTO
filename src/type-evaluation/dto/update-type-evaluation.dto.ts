import { PartialType } from '@nestjs/mapped-types';
import { CreateTypeEvaluationDto } from './create-type-evaluation.dto';

export class UpdateTypeEvaluationDto extends PartialType(CreateTypeEvaluationDto) {}
