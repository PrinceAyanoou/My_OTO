import { Module } from '@nestjs/common';
import { DecisionFinAnneeService } from './decision-fin-annee.service';
import { DecisionFinAnneeController } from './decision-fin-annee.controller';

@Module({
  controllers: [DecisionFinAnneeController],
  providers: [DecisionFinAnneeService],
})
export class DecisionFinAnneeModule {}
