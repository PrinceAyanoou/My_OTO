import { Test, TestingModule } from '@nestjs/testing';
import { AffectationEnseignantService } from './affectation-enseignant.service';

describe('AffectationEnseignantService', () => {
  let service: AffectationEnseignantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AffectationEnseignantService],
    }).compile();

    service = module.get<AffectationEnseignantService>(AffectationEnseignantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
