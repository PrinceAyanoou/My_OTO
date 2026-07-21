import { Test, TestingModule } from '@nestjs/testing';
import { MatiereUeService } from './matiere-ue.service';

describe('MatiereUeService', () => {
  let service: MatiereUeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatiereUeService],
    }).compile();

    service = module.get<MatiereUeService>(MatiereUeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
