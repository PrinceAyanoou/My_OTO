import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { AnneeScolaireService } from '../annee-scolaire/annee-scolaire.service';
import { PeriodeScolaireService } from './periode-scolaire.service';

describe('PeriodeScolaireService', () => {
  let service: PeriodeScolaireService;

  const prismaMock = {
    periodescolaire: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
  };
  const anneeServiceMock = { findOne: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PeriodeScolaireService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AnneeScolaireService, useValue: anneeServiceMock },
      ],
    }).compile();

    service = module.get<PeriodeScolaireService>(PeriodeScolaireService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('retourne les périodes paginées', async () => {
    const response = [{ id: 'periode-1' }];
    anneeServiceMock.findOne.mockResolvedValue({ id: 'annee-1' });
    prismaMock.periodescolaire.findMany.mockResolvedValue(response);
    prismaMock.periodescolaire.count.mockResolvedValue(1);

    await expect(
      service.findAll('ecole-1', 'annee-1', { page: 1, limit: 10 } as never),
    ).resolves.toEqual({
      data: response,
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });
  });
});
