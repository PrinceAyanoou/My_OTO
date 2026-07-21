import { Test, TestingModule } from '@nestjs/testing';
import { CibleAnnonceService } from './cible-annonce.service';

describe('CibleAnnonceService', () => {
  let service: CibleAnnonceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CibleAnnonceService],
    }).compile();

    service = module.get<CibleAnnonceService>(CibleAnnonceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
