import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PolitiqueEvaluationService } from './politique-evaluation.service';

describe('PolitiqueEvaluationService', () => {
  let service: PolitiqueEvaluationService;

  const prismaMock = { politiqueevaluation: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() }, anneescolaire: { findFirst: jest.fn() }, classscolaire: { findFirst: jest.fn() } };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [PolitiqueEvaluationService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get<PolitiqueEvaluationService>(PolitiqueEvaluationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('liste les politiques d’une école', async () => {
    const response = [{ id: 'politique-1' }];
    prismaMock.politiqueevaluation.findMany.mockResolvedValue(response);
    await expect(service.findAll('ecole-1', 'annee-1')).resolves.toBe(response);
    expect(prismaMock.politiqueevaluation.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { ecoleId: 'ecole-1', anneeScolaireId: 'annee-1' } }));
  });
});
