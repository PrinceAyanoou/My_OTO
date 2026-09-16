import { Module } from '@nestjs/common';
import { TrancheScolariteService } from './tranche-scolarite.service';
import { TrancheScolariteController } from './tranche-scolarite.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [TrancheScolariteController],
  providers: [TrancheScolariteService, PrismaService],
})
export class TrancheScolariteModule {}
