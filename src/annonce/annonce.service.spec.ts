import { Test, TestingModule } from '@nestjs/testing';
import { AnnonceService } from './annonce.service';

describe('AnnonceService', () => {
  let service: AnnonceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnnonceService],
    }).compile();

    service = module.get<AnnonceService>(AnnonceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
