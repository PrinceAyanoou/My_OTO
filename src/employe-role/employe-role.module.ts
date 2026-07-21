import { Module } from '@nestjs/common';
import { EmployeRoleService } from './employe-role.service';
import { EmployeRoleController } from './employe-role.controller';

@Module({
  controllers: [EmployeRoleController],
  providers: [EmployeRoleService],
})
export class EmployeRoleModule {}
