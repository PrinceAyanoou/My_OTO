import { Module } from '@nestjs/common';
import { ApprenantParentService } from './apprenant-parent.service';
import { ApprenantParentController } from './apprenant-parent.controller';

@Module({
  controllers: [ApprenantParentController],
  providers: [ApprenantParentService],
})
export class ApprenantParentModule {}
