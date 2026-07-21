import { Test, TestingModule } from '@nestjs/testing';
import { AnnonceController } from './annonce.controller';
import { AnnonceService } from './annonce.service';

describe('AnnonceController', () => {
  let controller: AnnonceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnonceController],
      providers: [AnnonceService],
    }).compile();

    controller = module.get<AnnonceController>(AnnonceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
