import { Test, TestingModule } from '@nestjs/testing';
import { DecisionFinAnneeService } from './decision-fin-annee.service';

describe('DecisionFinAnneeService', () => {
  let service: DecisionFinAnneeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DecisionFinAnneeService],
    }).compile();

    service = module.get<DecisionFinAnneeService>(DecisionFinAnneeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
