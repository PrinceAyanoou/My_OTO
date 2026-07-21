import { Test, TestingModule } from '@nestjs/testing';
import { AnneeScolaireService } from './annee-scolaire.service';

describe('AnneeScolaireService', () => {
  let service: AnneeScolaireService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnneeScolaireService],
    }).compile();

    service = module.get<AnneeScolaireService>(AnneeScolaireService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
