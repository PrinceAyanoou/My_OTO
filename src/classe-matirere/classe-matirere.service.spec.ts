import { Test, TestingModule } from '@nestjs/testing';
import { ClasseMatirereService } from './classe-matirere.service';

describe('ClasseMatirereService', () => {
  let service: ClasseMatirereService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClasseMatirereService],
    }).compile();

    service = module.get<ClasseMatirereService>(ClasseMatirereService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
