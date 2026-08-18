import { Module } from '@nestjs/common';
import { MatiereService } from './matiere.service';
import { MatiereController } from './matiere.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [MatiereController],
  providers: [MatiereService, PrismaService],
})
export class MatiereModule {}
