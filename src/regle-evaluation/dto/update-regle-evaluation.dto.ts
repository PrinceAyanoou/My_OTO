import { PartialType } from '@nestjs/mapped-types';
import { CreateRegleEvaluationDto } from './create-regle-evaluation.dto';

export class UpdateRegleEvaluationDto extends PartialType(CreateRegleEvaluationDto) {}
