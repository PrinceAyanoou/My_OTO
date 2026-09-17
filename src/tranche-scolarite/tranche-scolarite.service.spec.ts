import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TrancheScolariteService } from './tranche-scolarite.service';

describe('TrancheScolariteService', () => {
  let service: TrancheScolariteService;

  const prismaMock = {
    ecole: { findUnique: jest.fn() },
    configurationscolarite: { findFirst: jest.fn() },
    tranchescolarite: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrancheScolariteService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<TrancheScolariteService>(TrancheScolariteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('liste les tranches d’une configuration validée', async () => {
    const response = [{ id: 'tranche-1' }];
    prismaMock.ecole.findUnique.mockResolvedValue({ id: 'ecole-1' });
    prismaMock.configurationscolarite.findFirst.mockResolvedValue({
      id: 'config-1',
      ecoleId: 'ecole-1',
    });
    prismaMock.tranchescolarite.findMany.mockResolvedValue(response);
    await expect(service.findAll('ecole-1', 'config-1')).resolves.toBe(
      response,
    );
    expect(prismaMock.tranchescolarite.findMany).toHaveBeenCalledWith({
      where: { configurationScolariteId: 'config-1' },
      orderBy: { ordre: 'asc' },
    });
  });
});
