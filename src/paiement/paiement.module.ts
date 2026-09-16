import { Module } from '@nestjs/common';
import { PaiementService } from './paiement.service';
import { PaiementController } from './paiement.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PaiementController],
  providers: [PaiementService, PrismaService],
})
export class PaiementModule {}
