import { Test, TestingModule } from '@nestjs/testing';
import { EcoleController } from './ecole.controller';
import { EcoleService } from './ecole.service';

describe('EcoleController', () => {
  let controller: EcoleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EcoleController],
      providers: [EcoleService],
    }).compile();

    controller = module.get<EcoleController>(EcoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
