import { Test, TestingModule } from '@nestjs/testing';
import { TypeEvaluationController } from './type-evaluation.controller';
import { TypeEvaluationService } from './type-evaluation.service';

describe('TypeEvaluationController', () => {
  let controller: TypeEvaluationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeEvaluationController],
      providers: [TypeEvaluationService],
    }).compile();

    controller = module.get<TypeEvaluationController>(TypeEvaluationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
