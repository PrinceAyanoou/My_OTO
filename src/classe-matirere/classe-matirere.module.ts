import { Module } from '@nestjs/common';
import { ClasseMatirereService } from './classe-matirere.service';
import { ClasseMatirereController } from './classe-matirere.controller';

@Module({
  controllers: [ClasseMatirereController],
  providers: [ClasseMatirereService],
})
export class ClasseMatirereModule {}
