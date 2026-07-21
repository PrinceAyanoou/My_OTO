import { Module } from '@nestjs/common';
import { DossierScolariteService } from './dossier-scolarite.service';
import { DossierScolariteController } from './dossier-scolarite.controller';

@Module({
  controllers: [DossierScolariteController],
  providers: [DossierScolariteService],
})
export class DossierScolariteModule {}
