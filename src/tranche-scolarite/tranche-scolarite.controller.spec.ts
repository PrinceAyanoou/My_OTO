import { Test, TestingModule } from '@nestjs/testing';
import { TrancheScolariteController } from './tranche-scolarite.controller';
import { TrancheScolariteService } from './tranche-scolarite.service';

describe('TrancheScolariteController', () => {
  let controller: TrancheScolariteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrancheScolariteController],
      providers: [TrancheScolariteService],
    }).compile();

    controller = module.get<TrancheScolariteController>(TrancheScolariteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
