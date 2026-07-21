import { Test, TestingModule } from '@nestjs/testing';
import { ApprenantParentService } from './apprenant-parent.service';

describe('ApprenantParentService', () => {
  let service: ApprenantParentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApprenantParentService],
    }).compile();

    service = module.get<ApprenantParentService>(ApprenantParentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
