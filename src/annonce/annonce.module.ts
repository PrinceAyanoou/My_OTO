import { Module } from '@nestjs/common';
import { AnnonceService } from './annonce.service';
import { AnnonceController } from './annonce.controller';

@Module({
  controllers: [AnnonceController],
  providers: [AnnonceService],
})
export class AnnonceModule {}
