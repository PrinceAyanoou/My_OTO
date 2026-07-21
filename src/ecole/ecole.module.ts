import { Module } from '@nestjs/common';
import { EcoleService } from './ecole.service';
import { EcoleController } from './ecole.controller';

@Module({
  controllers: [EcoleController],
  providers: [EcoleService],
})
export class EcoleModule {}
