import { Module } from '@nestjs/common';
import { TypeEvaluationService } from './type-evaluation.service';
import { TypeEvaluationController } from './type-evaluation.controller';

@Module({
  controllers: [TypeEvaluationController],
  providers: [TypeEvaluationService],
})
export class TypeEvaluationModule {}
