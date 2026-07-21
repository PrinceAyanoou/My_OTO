import { Test, TestingModule } from '@nestjs/testing';
import { ClasseScolaireService } from './classe-scolaire.service';

describe('ClasseScolaireService', () => {
  let service: ClasseScolaireService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClasseScolaireService],
    }).compile();

    service = module.get<ClasseScolaireService>(ClasseScolaireService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
