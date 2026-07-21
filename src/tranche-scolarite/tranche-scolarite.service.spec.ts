import { Test, TestingModule } from '@nestjs/testing';
import { TrancheScolariteService } from './tranche-scolarite.service';

describe('TrancheScolariteService', () => {
  let service: TrancheScolariteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrancheScolariteService],
    }).compile();

    service = module.get<TrancheScolariteService>(TrancheScolariteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
