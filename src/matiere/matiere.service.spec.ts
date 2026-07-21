import { Test, TestingModule } from '@nestjs/testing';
import { MatiereService } from './matiere.service';

describe('MatiereService', () => {
  let service: MatiereService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatiereService],
    }).compile();

    service = module.get<MatiereService>(MatiereService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
