import { Module } from '@nestjs/common';
import { ApprenantParentService } from './apprenant-parent.service';
import { ApprenantParentController } from './apprenant-parent.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ApprenantParentController],
  providers: [ApprenantParentService, PrismaService],
})
export class ApprenantParentModule {}
