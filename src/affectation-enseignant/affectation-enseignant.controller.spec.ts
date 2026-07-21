import { Test, TestingModule } from '@nestjs/testing';
import { AffectationEnseignantController } from './affectation-enseignant.controller';
import { AffectationEnseignantService } from './affectation-enseignant.service';

describe('AffectationEnseignantController', () => {
  let controller: AffectationEnseignantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AffectationEnseignantController],
      providers: [AffectationEnseignantService],
    }).compile();

    controller = module.get<AffectationEnseignantController>(AffectationEnseignantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
