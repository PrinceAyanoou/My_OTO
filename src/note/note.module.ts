import { Module } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { StudentTokenService } from './hash.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [NoteController],
  providers: [NoteService, StudentTokenService, PrismaService],
})
export class NoteModule {}
