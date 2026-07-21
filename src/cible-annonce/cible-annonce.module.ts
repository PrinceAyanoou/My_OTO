import { Module } from '@nestjs/common';
import { CibleAnnonceService } from './cible-annonce.service';
import { CibleAnnonceController } from './cible-annonce.controller';

@Module({
  controllers: [CibleAnnonceController],
  providers: [CibleAnnonceService],
})
export class CibleAnnonceModule {}
