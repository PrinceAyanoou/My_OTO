import { Test, TestingModule } from '@nestjs/testing';
import { ClasseMatirereController } from './classe-matirere.controller';
import { ClasseMatirereService } from './classe-matirere.service';

describe('ClasseMatirereController', () => {
  let controller: ClasseMatirereController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClasseMatirereController],
      providers: [ClasseMatirereService],
    }).compile();

    controller = module.get<ClasseMatirereController>(ClasseMatirereController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
