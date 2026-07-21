import { Module } from '@nestjs/common';
import { PolitiqueEvaluationService } from './politique-evaluation.service';
import { PolitiqueEvaluationController } from './politique-evaluation.controller';

@Module({
  controllers: [PolitiqueEvaluationController],
  providers: [PolitiqueEvaluationService],
})
export class PolitiqueEvaluationModule {}
