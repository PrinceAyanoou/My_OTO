import { Module } from '@nestjs/common';
import { LigneBulletinService } from './ligne-bulletin.service';
import { LigneBulletinController } from './ligne-bulletin.controller';

@Module({
  controllers: [LigneBulletinController],
  providers: [LigneBulletinService],
})
export class LigneBulletinModule {}
