import { PartialType } from '@nestjs/mapped-types';
import { CreatePolitiqueEvaluationDto } from './create-politique-evaluation.dto';

export class UpdatePolitiqueEvaluationDto extends PartialType(CreatePolitiqueEvaluationDto) {}
