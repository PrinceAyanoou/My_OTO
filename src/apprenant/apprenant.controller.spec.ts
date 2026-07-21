import { Test, TestingModule } from '@nestjs/testing';
import { ApprenantController } from './apprenant.controller';
import { ApprenantService } from './apprenant.service';

describe('ApprenantController', () => {
  let controller: ApprenantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApprenantController],
      providers: [ApprenantService],
    }).compile();

    controller = module.get<ApprenantController>(ApprenantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
