import { Module } from '@nestjs/common';
import { AffectationEnseignantService } from './affectation-enseignant.service';
import { AffectationEnseignantController } from './affectation-enseignant.controller';

@Module({
  controllers: [AffectationEnseignantController],
  providers: [AffectationEnseignantService],
})
export class AffectationEnseignantModule {}
