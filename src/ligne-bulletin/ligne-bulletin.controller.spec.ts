import { Test, TestingModule } from '@nestjs/testing';
import { LigneBulletinController } from './ligne-bulletin.controller';
import { LigneBulletinService } from './ligne-bulletin.service';

describe('LigneBulletinController', () => {
  let controller: LigneBulletinController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LigneBulletinController],
      providers: [LigneBulletinService],
    }).compile();

    controller = module.get<LigneBulletinController>(LigneBulletinController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
