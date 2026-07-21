import { Test, TestingModule } from '@nestjs/testing';
import { EcoleService } from './ecole.service';

describe('EcoleService', () => {
  let service: EcoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EcoleService],
    }).compile();

    service = module.get<EcoleService>(EcoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
