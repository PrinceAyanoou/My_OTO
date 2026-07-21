import { Test, TestingModule } from '@nestjs/testing';
import { UniteEnseignementService } from './unite-enseignement.service';

describe('UniteEnseignementService', () => {
  let service: UniteEnseignementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UniteEnseignementService],
    }).compile();

    service = module.get<UniteEnseignementService>(UniteEnseignementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
