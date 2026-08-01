import { Module } from '@nestjs/common';
import { UsersService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersController } from './user.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
})
export class UserModule {}
