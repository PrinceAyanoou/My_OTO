import { Module } from '@nestjs/common';
import { EcoleService } from './ecole.service';
import { EcoleController } from './ecole.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [EcoleController],
  providers: [EcoleService, PrismaService],
})
export class EcoleModule {}
