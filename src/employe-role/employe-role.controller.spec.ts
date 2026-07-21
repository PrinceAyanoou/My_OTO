import { Test, TestingModule } from '@nestjs/testing';
import { EmployeRoleController } from './employe-role.controller';
import { EmployeRoleService } from './employe-role.service';

describe('EmployeRoleController', () => {
  let controller: EmployeRoleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeRoleController],
      providers: [EmployeRoleService],
    }).compile();

    controller = module.get<EmployeRoleController>(EmployeRoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
