import { Module } from '@nestjs/common';
import { PeriodeScolaireService } from './periode-scolaire.service';
import { PeriodeScolaireController } from './periode-scolaire.controller';

@Module({
  controllers: [PeriodeScolaireController],
  providers: [PeriodeScolaireService],
})
export class PeriodeScolaireModule {}
