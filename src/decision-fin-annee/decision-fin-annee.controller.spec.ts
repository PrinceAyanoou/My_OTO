import { Test, TestingModule } from '@nestjs/testing';
import { DecisionFinAnneeController } from './decision-fin-annee.controller';
import { DecisionFinAnneeService } from './decision-fin-annee.service';

describe('DecisionFinAnneeController', () => {
  let controller: DecisionFinAnneeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DecisionFinAnneeController],
      providers: [DecisionFinAnneeService],
    }).compile();

    controller = module.get<DecisionFinAnneeController>(DecisionFinAnneeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
