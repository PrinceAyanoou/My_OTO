import { Module } from '@nestjs/common';
import { EmployeService } from './employe.service';
import { EmployeController } from './employe.controller';

@Module({
  controllers: [EmployeController],
  providers: [EmployeService],
})
export class EmployeModule {}
