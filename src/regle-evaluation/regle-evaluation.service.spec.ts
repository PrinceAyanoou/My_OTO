import { Test, TestingModule } from '@nestjs/testing';
import { RegleEvaluationService } from './regle-evaluation.service';

describe('RegleEvaluationService', () => {
  let service: RegleEvaluationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegleEvaluationService],
    }).compile();

    service = module.get<RegleEvaluationService>(RegleEvaluationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
