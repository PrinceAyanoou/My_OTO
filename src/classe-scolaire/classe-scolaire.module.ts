import { Module } from '@nestjs/common';
import { ClasseScolaireService } from './classe-scolaire.service';
import { ClasseScolaireController } from './classe-scolaire.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ClasseScolaireController],
  providers: [ClasseScolaireService, PrismaService],
})
export class ClasseScolaireModule {}
