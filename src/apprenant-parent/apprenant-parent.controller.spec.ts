import { Test, TestingModule } from '@nestjs/testing';
import { ApprenantParentController } from './apprenant-parent.controller';
import { ApprenantParentService } from './apprenant-parent.service';

describe('ApprenantParentController', () => {
  let controller: ApprenantParentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApprenantParentController],
      providers: [ApprenantParentService],
    }).compile();

    controller = module.get<ApprenantParentController>(ApprenantParentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
