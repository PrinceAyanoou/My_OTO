import { Module } from '@nestjs/common';
import { AffectationEnseignantService } from './affectation-enseignant.service';
import { AffectationEnseignantController } from './affectation-enseignant.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AffectationEnseignantController],
  providers: [AffectationEnseignantService, PrismaService],
})
export class AffectationEnseignantModule {}
