import { Test, TestingModule } from '@nestjs/testing';
import { NiveauScolaireService } from './niveau-scolaire.service';

describe('NiveauScolaireService', () => {
  let service: NiveauScolaireService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NiveauScolaireService],
    }).compile();

    service = module.get<NiveauScolaireService>(NiveauScolaireService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
