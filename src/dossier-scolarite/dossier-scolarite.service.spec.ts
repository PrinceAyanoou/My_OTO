import { Test, TestingModule } from '@nestjs/testing';
import { DossierScolariteService } from './dossier-scolarite.service';

describe('DossierScolariteService', () => {
  let service: DossierScolariteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DossierScolariteService],
    }).compile();

    service = module.get<DossierScolariteService>(DossierScolariteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
