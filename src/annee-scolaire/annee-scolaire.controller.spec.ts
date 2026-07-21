import { Test, TestingModule } from '@nestjs/testing';
import { AnneeScolaireController } from './annee-scolaire.controller';
import { AnneeScolaireService } from './annee-scolaire.service';

describe('AnneeScolaireController', () => {
  let controller: AnneeScolaireController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnneeScolaireController],
      providers: [AnneeScolaireService],
    }).compile();

    controller = module.get<AnneeScolaireController>(AnneeScolaireController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
