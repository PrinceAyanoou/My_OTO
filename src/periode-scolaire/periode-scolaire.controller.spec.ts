import { Test, TestingModule } from '@nestjs/testing';
import { PeriodeScolaireController } from './periode-scolaire.controller';
import { PeriodeScolaireService } from './periode-scolaire.service';

describe('PeriodeScolaireController', () => {
  let controller: PeriodeScolaireController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeriodeScolaireController],
      providers: [PeriodeScolaireService],
    }).compile();

    controller = module.get<PeriodeScolaireController>(PeriodeScolaireController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
