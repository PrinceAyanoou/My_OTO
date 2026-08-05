import { Test, TestingModule } from '@nestjs/testing';
import { DemandeEcoleService } from './demande-ecole.service';

describe('DemandeEcoleService', () => {
  let service: DemandeEcoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DemandeEcoleService],
    }).compile();

    service = module.get<DemandeEcoleService>(DemandeEcoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
