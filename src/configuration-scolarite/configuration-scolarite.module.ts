import { Module } from '@nestjs/common';
import { ConfigurationScolariteService } from './configuration-scolarite.service';
import { ConfigurationScolariteController } from './configuration-scolarite.controller';

@Module({
  controllers: [ConfigurationScolariteController],
  providers: [ConfigurationScolariteService],
})
export class ConfigurationScolariteModule {}
