import { Test, TestingModule } from '@nestjs/testing';
import { RegleEvaluationController } from './regle-evaluation.controller';
import { RegleEvaluationService } from './regle-evaluation.service';

describe('RegleEvaluationController', () => {
  let controller: RegleEvaluationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegleEvaluationController],
      providers: [RegleEvaluationService],
    }).compile();

    controller = module.get<RegleEvaluationController>(RegleEvaluationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
