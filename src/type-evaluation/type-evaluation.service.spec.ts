import { Test, TestingModule } from '@nestjs/testing';
import { TypeEvaluationService } from './type-evaluation.service';

describe('TypeEvaluationService', () => {
  let service: TypeEvaluationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeEvaluationService],
    }).compile();

    service = module.get<TypeEvaluationService>(TypeEvaluationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
