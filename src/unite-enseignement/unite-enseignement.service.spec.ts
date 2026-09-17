import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UniteEnseignementService } from './unite-enseignement.service';

describe('UniteEnseignementService', () => {
  let service: UniteEnseignementService;

  const prismaMock = { ecole: { findUnique: jest.fn() }, uniteenseignement: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() }, matiere: { count: jest.fn() }, $transaction: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [UniteEnseignementService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get<UniteEnseignementService>(UniteEnseignementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('lève une erreur si l’école est introuvable', async () => {
    prismaMock.ecole.findUnique.mockResolvedValue(null);
    await expect(service.findAllByEcole('ecole-1')).rejects.toThrow("Cette école n'existe pas");
  });
});
