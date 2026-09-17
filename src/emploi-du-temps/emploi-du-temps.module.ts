import { Module } from '@nestjs/common';
import { EmploiDuTempsService } from './emploi-du-temps.service';
import { EmploiDuTempsController } from './emploi-du-temps.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [EmploiDuTempsController],
  providers: [EmploiDuTempsService, PrismaService],
})
export class EmploiDuTempsModule {}
