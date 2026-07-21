import { Test, TestingModule } from '@nestjs/testing';
import { PolitiqueEvaluationService } from './politique-evaluation.service';

describe('PolitiqueEvaluationService', () => {
  let service: PolitiqueEvaluationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PolitiqueEvaluationService],
    }).compile();

    service = module.get<PolitiqueEvaluationService>(PolitiqueEvaluationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
