import { Test, TestingModule } from '@nestjs/testing';
import { ClasseScolaireController } from './classe-scolaire.controller';
import { ClasseScolaireService } from './classe-scolaire.service';

describe('ClasseScolaireController', () => {
  let controller: ClasseScolaireController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClasseScolaireController],
      providers: [ClasseScolaireService],
    }).compile();

    controller = module.get<ClasseScolaireController>(ClasseScolaireController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
