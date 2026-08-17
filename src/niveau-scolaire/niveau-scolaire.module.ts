import { Module } from '@nestjs/common';
import { NiveauScolaireService } from './niveau-scolaire.service';
import { NiveauScolaireController } from './niveau-scolaire.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [NiveauScolaireController],
  providers: [NiveauScolaireService, PrismaService],
})
export class NiveauScolaireModule {}
