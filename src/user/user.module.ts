import { Module } from '@nestjs/common';
import { UsersService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersController } from './user.controller';
import { ClerkWebhookController } from '../webhook/clerk-webhook.controller';

@Module({
  controllers: [UsersController, ClerkWebhookController],
  providers: [UsersService, PrismaService],
})
export class UserModule {}
