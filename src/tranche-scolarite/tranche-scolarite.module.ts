import { Module } from '@nestjs/common';
import { TrancheScolariteService } from './tranche-scolarite.service';
import { TrancheScolariteController } from './tranche-scolarite.controller';

@Module({
  controllers: [TrancheScolariteController],
  providers: [TrancheScolariteService],
})
export class TrancheScolariteModule {}
