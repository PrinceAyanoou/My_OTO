import { Module } from '@nestjs/common';
import { RegleEvaluationService } from './regle-evaluation.service';
import { RegleEvaluationController } from './regle-evaluation.controller';

@Module({
  controllers: [RegleEvaluationController],
  providers: [RegleEvaluationService],
})
export class RegleEvaluationModule {}
