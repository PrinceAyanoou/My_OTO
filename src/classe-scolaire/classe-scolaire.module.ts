import { Module } from '@nestjs/common';
import { ClasseScolaireService } from './classe-scolaire.service';
import { ClasseScolaireController } from './classe-scolaire.controller';

@Module({
  controllers: [ClasseScolaireController],
  providers: [ClasseScolaireService],
})
export class ClasseScolaireModule {}
