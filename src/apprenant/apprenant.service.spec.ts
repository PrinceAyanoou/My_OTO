import { Test, TestingModule } from '@nestjs/testing';
import { ApprenantService } from './apprenant.service';

describe('ApprenantService', () => {
  let service: ApprenantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApprenantService],
    }).compile();

    service = module.get<ApprenantService>(ApprenantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
