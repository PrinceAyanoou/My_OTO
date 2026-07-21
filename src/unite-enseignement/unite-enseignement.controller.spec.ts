import { Test, TestingModule } from '@nestjs/testing';
import { UniteEnseignementController } from './unite-enseignement.controller';
import { UniteEnseignementService } from './unite-enseignement.service';

describe('UniteEnseignementController', () => {
  let controller: UniteEnseignementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UniteEnseignementController],
      providers: [UniteEnseignementService],
    }).compile();

    controller = module.get<UniteEnseignementController>(UniteEnseignementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
