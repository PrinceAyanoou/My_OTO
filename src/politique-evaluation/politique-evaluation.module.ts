import { Module } from '@nestjs/common';
import { PolitiqueEvaluationService } from './politique-evaluation.service';
import { PolitiqueEvaluationController } from './politique-evaluation.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PolitiqueEvaluationController],
  providers: [PolitiqueEvaluationService, PrismaService],
})
export class PolitiqueEvaluationModule {}
