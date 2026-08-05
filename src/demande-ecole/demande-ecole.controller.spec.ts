import { Test, TestingModule } from '@nestjs/testing';
import { DemandeEcoleController } from './demande-ecole.controller';

describe('DemandeEcoleController', () => {
  let controller: DemandeEcoleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DemandeEcoleController],
    }).compile();

    controller = module.get<DemandeEcoleController>(DemandeEcoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
