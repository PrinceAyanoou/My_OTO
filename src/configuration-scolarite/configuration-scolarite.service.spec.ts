import { Test, TestingModule } from '@nestjs/testing';
import { ConfigurationScolariteService } from './configuration-scolarite.service';

describe('ConfigurationScolariteService', () => {
  let service: ConfigurationScolariteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigurationScolariteService],
    }).compile();

    service = module.get<ConfigurationScolariteService>(ConfigurationScolariteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
