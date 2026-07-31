import { Module } from '@nestjs/common';
import { UsersService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersController } from './user.controller';
import { WebhookController } from './webhook.controller';

@Module({
  controllers: [UsersController, WebhookController],
  providers: [UsersService, PrismaService],
})
export class UserModule {}
