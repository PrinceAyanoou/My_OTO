import { Module } from '@nestjs/common';
import { ApprenantService } from './apprenant.service';
import { ApprenantController } from './apprenant.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ApprenantController],
  providers: [ApprenantService, PrismaService],
})
export class ApprenantModule {}
