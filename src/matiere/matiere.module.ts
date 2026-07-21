import { Module } from '@nestjs/common';
import { MatiereService } from './matiere.service';
import { MatiereController } from './matiere.controller';

@Module({
  controllers: [MatiereController],
  providers: [MatiereService],
})
export class MatiereModule {}
