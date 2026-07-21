import { Test, TestingModule } from '@nestjs/testing';
import { EmploiDuTempsController } from './emploi-du-temps.controller';
import { EmploiDuTempsService } from './emploi-du-temps.service';

describe('EmploiDuTempsController', () => {
  let controller: EmploiDuTempsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmploiDuTempsController],
      providers: [EmploiDuTempsService],
    }).compile();

    controller = module.get<EmploiDuTempsController>(EmploiDuTempsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
