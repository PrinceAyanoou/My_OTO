import { Test, TestingModule } from '@nestjs/testing';
import { ConfigurationScolariteController } from './configuration-scolarite.controller';
import { ConfigurationScolariteService } from './configuration-scolarite.service';

describe('ConfigurationScolariteController', () => {
  let controller: ConfigurationScolariteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigurationScolariteController],
      providers: [ConfigurationScolariteService],
    }).compile();

    controller = module.get<ConfigurationScolariteController>(ConfigurationScolariteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
