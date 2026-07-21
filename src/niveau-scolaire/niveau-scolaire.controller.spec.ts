import { Test, TestingModule } from '@nestjs/testing';
import { NiveauScolaireController } from './niveau-scolaire.controller';
import { NiveauScolaireService } from './niveau-scolaire.service';

describe('NiveauScolaireController', () => {
  let controller: NiveauScolaireController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NiveauScolaireController],
      providers: [NiveauScolaireService],
    }).compile();

    controller = module.get<NiveauScolaireController>(NiveauScolaireController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
