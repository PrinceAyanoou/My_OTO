import { Module } from '@nestjs/common';
import { BackofficeService } from './backoffice.service';
import { BackofficeController } from './backoffice.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [BackofficeController],
  providers: [BackofficeService, PrismaService],
})
export class BackofficeModule {}
