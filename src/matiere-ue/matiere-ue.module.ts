import { Module } from '@nestjs/common';
import { MatiereUeService } from './matiere-ue.service';
import { MatiereUeController } from './matiere-ue.controller';

@Module({
  controllers: [MatiereUeController],
  providers: [MatiereUeService],
})
export class MatiereUeModule {}
