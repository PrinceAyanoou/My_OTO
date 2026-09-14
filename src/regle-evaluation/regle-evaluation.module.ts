import { Module } from '@nestjs/common';
import { RegleEvaluationService } from './regle-evaluation.service';
import { RegleEvaluationController } from './regle-evaluation.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [RegleEvaluationController],
  providers: [RegleEvaluationService, PrismaService],
})
export class RegleEvaluationModule {}
