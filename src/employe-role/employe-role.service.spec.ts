import { Test, TestingModule } from '@nestjs/testing';
import { EmployeRoleService } from './employe-role.service';

describe('EmployeRoleService', () => {
  let service: EmployeRoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeRoleService],
    }).compile();

    service = module.get<EmployeRoleService>(EmployeRoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
