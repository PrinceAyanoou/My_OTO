import { Module } from '@nestjs/common';
import { UniteEnseignementService } from './unite-enseignement.service';
import { UniteEnseignementController } from './unite-enseignement.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [UniteEnseignementController],
  providers: [UniteEnseignementService, PrismaService],
})
export class UniteEnseignementModule {}
