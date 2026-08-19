import { Module } from '@nestjs/common';
import { ClasseMatiereService } from './classe-matirere.service';
import { ClasseMatiereController } from './classe-matirere.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ClasseMatiereController],
  providers: [ClasseMatiereService, PrismaService],
})
export class ClasseMatirereModule {}
