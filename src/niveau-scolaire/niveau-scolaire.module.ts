import { Module } from '@nestjs/common';
import { NiveauScolaireService } from './niveau-scolaire.service';
import { NiveauScolaireController } from './niveau-scolaire.controller';

@Module({
  controllers: [NiveauScolaireController],
  providers: [NiveauScolaireService],
})
export class NiveauScolaireModule {}
