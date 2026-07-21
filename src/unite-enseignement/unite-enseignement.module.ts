import { Module } from '@nestjs/common';
import { UniteEnseignementService } from './unite-enseignement.service';
import { UniteEnseignementController } from './unite-enseignement.controller';

@Module({
  controllers: [UniteEnseignementController],
  providers: [UniteEnseignementService],
})
export class UniteEnseignementModule {}
