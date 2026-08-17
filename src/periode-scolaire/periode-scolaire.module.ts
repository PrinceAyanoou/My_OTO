import { Module } from '@nestjs/common';
import { PeriodeScolaireService } from './periode-scolaire.service';
import { PeriodeScolaireController } from './periode-scolaire.controller';
import { AnneeScolaireService } from 'src/annee-scolaire/annee-scolaire.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PeriodeScolaireController],
  providers: [PeriodeScolaireService, AnneeScolaireService, PrismaService],
})
export class PeriodeScolaireModule {}
