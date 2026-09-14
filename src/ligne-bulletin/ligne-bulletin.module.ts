import { Module } from '@nestjs/common';
import { LigneBulletinService } from './ligne-bulletin.service';
import { LigneBulletinController } from './ligne-bulletin.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [LigneBulletinController],
  providers: [LigneBulletinService, PrismaService],
})
export class LigneBulletinModule {}
