import { Test, TestingModule } from '@nestjs/testing';
import { MatiereUeController } from './matiere-ue.controller';
import { MatiereUeService } from './matiere-ue.service';

describe('MatiereUeController', () => {
  let controller: MatiereUeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatiereUeController],
      providers: [MatiereUeService],
    }).compile();

    controller = module.get<MatiereUeController>(MatiereUeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
