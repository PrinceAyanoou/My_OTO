import { Module } from '@nestjs/common';
import { ConfigurationScolariteService } from './configuration-scolarite.service';
import { ConfigurationScolariteController } from './configuration-scolarite.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ConfigurationScolariteController],
  providers: [ConfigurationScolariteService, PrismaService],
})
export class ConfigurationScolariteModule {}
