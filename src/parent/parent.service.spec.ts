import { Test, TestingModule } from '@nestjs/testing';
import { ParentService } from './parent.service';
import { PrismaService } from '../prisma/prisma.service';

const clerkMock = {
  invitations: { createInvitation: jest.fn(), revokeInvitation: jest.fn() },
};
jest.mock('@clerk/backend', () => ({
  createClerkClient: jest.fn(() => clerkMock),
}));

describe('ParentService', () => {
  let service: ParentService;

  const prismaMock = {
    parent: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: { findUnique: jest.fn() },
    inscription: { count: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParentService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ParentService>(ParentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('retourne les parents avec pagination', async () => {
    const data = [{ id: 'parent-1' }];
    prismaMock.parent.count.mockResolvedValue(1);
    prismaMock.parent.findMany.mockResolvedValue(data);

    await expect(service.findAll({ page: 1, limit: 10 })).resolves.toEqual({
      data,
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });
    expect(prismaMock.parent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 10 }),
    );
  });

  it('lève une erreur si le parent n’est pas trouvé dans l’école', async () => {
    prismaMock.parent.findFirst.mockResolvedValue(null);

    await expect(service.findOne('parent-1', 'ecole-1')).rejects.toThrow(
      "Parent introuvable ou non associé à l'école spécifiée.",
    );
  });
});
