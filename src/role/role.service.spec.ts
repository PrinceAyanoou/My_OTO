import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './role.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RolesService', () => {
  let service: RolesService;

  const prismaMock = {
    role: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    permission: { findMany: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('retourne les rôles d’une école avec leurs permissions', async () => {
    const response = [{ id: 'role-1' }];
    prismaMock.role.findMany.mockResolvedValue(response);

    await expect(service.readRoleForMySchool('ecole-1')).resolves.toBe(
      response,
    );
    expect(prismaMock.role.findMany).toHaveBeenCalledWith({
      where: { ecoleId: 'ecole-1' },
      include: { rolepermission: { include: { permission: true } } },
    });
  });
});
