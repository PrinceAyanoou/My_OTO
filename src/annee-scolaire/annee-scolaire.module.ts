import { Module } from '@nestjs/common';
import { AnneeScolaireService } from './annee-scolaire.service';
import { AnneeScolaireController } from './annee-scolaire.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AnneeScolaireController],
  providers: [AnneeScolaireService, PrismaService],
})
export class AnneeScolaireModule {}
