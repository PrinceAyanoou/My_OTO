import { Module } from '@nestjs/common';
import { RolesService } from './role.service';
import { RoleController } from './role.controller';

@Module({
  controllers: [RoleController],
  providers: [RolesService],
})
export class RoleModule {}
