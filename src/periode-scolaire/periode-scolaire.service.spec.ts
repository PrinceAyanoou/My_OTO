import { Test, TestingModule } from '@nestjs/testing';
import { PeriodeScolaireService } from './periode-scolaire.service';

describe('PeriodeScolaireService', () => {
  let service: PeriodeScolaireService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PeriodeScolaireService],
    }).compile();

    service = module.get<PeriodeScolaireService>(PeriodeScolaireService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
