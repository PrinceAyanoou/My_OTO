import { Module } from '@nestjs/common';
import { MatiereUeService } from './matiere-ue.service';
import { MatiereUeController } from './matiere-ue.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [MatiereUeController],
  providers: [MatiereUeService, PrismaService],
})
export class MatiereUeModule {}
