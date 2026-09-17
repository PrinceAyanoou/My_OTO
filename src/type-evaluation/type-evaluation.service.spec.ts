import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TypeEvaluationService } from './type-evaluation.service';

describe('TypeEvaluationService', () => {
  let service: TypeEvaluationService;

  const prismaMock = {
    typeevaluation: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeEvaluationService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<TypeEvaluationService>(TypeEvaluationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('crée un type d’évaluation', async () => {
    const dto = { nom: 'Devoir' };
    const response = { id: 'type-1', ...dto };
    prismaMock.typeevaluation.findFirst.mockResolvedValue(null);
    prismaMock.typeevaluation.create.mockResolvedValue(response);
    await expect(service.create(dto, 'ecole-1')).resolves.toBe(response);
    expect(prismaMock.typeevaluation.create).toHaveBeenCalledWith({
      data: { nom: 'Devoir', ecoleId: 'ecole-1' },
    });
  });
});
