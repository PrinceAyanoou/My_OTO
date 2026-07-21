import { Test, TestingModule } from '@nestjs/testing';
import { PolitiqueEvaluationController } from './politique-evaluation.controller';
import { PolitiqueEvaluationService } from './politique-evaluation.service';

describe('PolitiqueEvaluationController', () => {
  let controller: PolitiqueEvaluationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PolitiqueEvaluationController],
      providers: [PolitiqueEvaluationService],
    }).compile();

    controller = module.get<PolitiqueEvaluationController>(PolitiqueEvaluationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
