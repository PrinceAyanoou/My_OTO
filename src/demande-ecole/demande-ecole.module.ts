import { Module } from '@nestjs/common';
import { DemandeEcoleService } from './demande-ecole.service';
import { DemandeEcoleController } from './demande-ecole.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [DemandeEcoleService, PrismaService],
  controllers: [DemandeEcoleController],
})
export class DemandeEcoleModule {}
