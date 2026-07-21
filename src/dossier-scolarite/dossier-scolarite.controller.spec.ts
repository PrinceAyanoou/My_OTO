import { Test, TestingModule } from '@nestjs/testing';
import { DossierScolariteController } from './dossier-scolarite.controller';
import { DossierScolariteService } from './dossier-scolarite.service';

describe('DossierScolariteController', () => {
  let controller: DossierScolariteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DossierScolariteController],
      providers: [DossierScolariteService],
    }).compile();

    controller = module.get<DossierScolariteController>(DossierScolariteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
