import { Module } from '@nestjs/common';
import { TypeEvaluationService } from './type-evaluation.service';
import { TypeEvaluationController } from './type-evaluation.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [TypeEvaluationController],
  providers: [TypeEvaluationService, PrismaService],
})
export class TypeEvaluationModule {}
