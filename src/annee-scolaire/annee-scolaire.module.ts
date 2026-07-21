import { Module } from '@nestjs/common';
import { AnneeScolaireService } from './annee-scolaire.service';
import { AnneeScolaireController } from './annee-scolaire.controller';

@Module({
  controllers: [AnneeScolaireController],
  providers: [AnneeScolaireService],
})
export class AnneeScolaireModule {}
