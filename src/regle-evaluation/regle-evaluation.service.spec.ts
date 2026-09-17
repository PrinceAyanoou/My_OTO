import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RegleEvaluationService } from './regle-evaluation.service';

describe('RegleEvaluationService', () => {
  let service: RegleEvaluationService;

  const prismaMock = {
    politiqueevaluation: { findFirst: jest.fn() },
    regleevaluation: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    typeevaluation: { findFirst: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegleEvaluationService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<RegleEvaluationService>(RegleEvaluationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('retourne les règles d’une politique accessible', async () => {
    const response = [{ id: 'regle-1' }];
    prismaMock.politiqueevaluation.findFirst.mockResolvedValue({
      id: 'politique-1',
      ecoleId: 'ecole-1',
    });
    prismaMock.regleevaluation.findMany.mockResolvedValue(response);
    await expect(
      service.findByPolitique('politique-1', 'ecole-1'),
    ).resolves.toBe(response);
    expect(prismaMock.regleevaluation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { politiqueId: 'politique-1' } }),
    );
  });
});
