import { Test, TestingModule } from '@nestjs/testing';
import { CibleAnnonceController } from './cible-annonce.controller';
import { CibleAnnonceService } from './cible-annonce.service';

describe('CibleAnnonceController', () => {
  let controller: CibleAnnonceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CibleAnnonceController],
      providers: [CibleAnnonceService],
    }).compile();

    controller = module.get<CibleAnnonceController>(CibleAnnonceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
