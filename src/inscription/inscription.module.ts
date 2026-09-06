import { Module } from '@nestjs/common';
import { InscriptionService } from './inscription.service';
import { InscriptionController } from './inscription.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [InscriptionController],
  providers: [InscriptionService, PrismaService],
})
export class InscriptionModule {}
