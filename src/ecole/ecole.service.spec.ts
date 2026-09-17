import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { EcoleService } from './ecole.service';

type PrismaMock = {
  ecole: {
    count: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
  };
  user: {
    findUnique: jest.Mock;
  };
  employe: {
    upsert: jest.Mock;
  };
  parent: {
    upsert: jest.Mock;
  };
  apprenant: {
    upsert: jest.Mock;
  };
  $transaction: jest.Mock;
};

describe('EcoleService', () => {
  let service: EcoleService;

  const prismaMock: PrismaMock = {
    ecole: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    employe: {
      upsert: jest.fn(),
    },
    parent: {
      upsert: jest.fn(),
    },
    apprenant: {
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const ecoleId = '11111111-1111-4111-8111-111111111111';
  const userId = '22222222-2222-4222-8222-222222222222';

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EcoleService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<EcoleService>(EcoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('retourne les écoles avec le total et le filtre de recherche', async () => {
      const response = { total: 2, ecoles: [{ id: ecoleId }] };
      prismaMock.ecole.count.mockResolvedValue(2);
      prismaMock.ecole.findMany.mockResolvedValue(response.ecoles);

      await expect(
        service.findAll({
          skip: 0,
          take: 10,
          ville: 'Cotonou',
          search: 'ecole',
        }),
      ).resolves.toEqual(response);
      expect(prismaMock.ecole.count).toHaveBeenCalledWith({
        where: {
          ville: { equals: 'Cotonou' },
          OR: [
            { nom: { contains: 'ecole' } },
            { code: { contains: 'ecole' } },
            { email: { contains: 'ecole' } },
            { nomFondateur: { contains: 'ecole' } },
          ],
        },
      });
      expect(prismaMock.ecole.findMany).toHaveBeenCalledWith({
        where: {
          ville: { equals: 'Cotonou' },
          OR: [
            { nom: { contains: 'ecole' } },
            { code: { contains: 'ecole' } },
            { email: { contains: 'ecole' } },
            { nomFondateur: { contains: 'ecole' } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          createur: {
            select: {
              id: true,
              clerkUserId: true,
              nom: true,
              prenoms: true,
              email: true,
            },
          },
          _count: {
            select: { user: true, anneescolaire: true },
          },
        },
      });
    });
  });

  describe('findOne', () => {
    it('retourne une école existante', async () => {
      const ecole = {
        id: ecoleId,
        createur: { id: userId },
        anneescolaire: [],
        niveauscolaire: [],
      };
      prismaMock.ecole.findUnique.mockResolvedValue(ecole);

      await expect(service.findOne(ecoleId)).resolves.toEqual(ecole);
      expect(prismaMock.ecole.findUnique).toHaveBeenCalledWith({
        where: { id: ecoleId },
        include: {
          createur: true,
          anneescolaire: { where: { statut: 'EN_COURS' } },
          niveauscolaire: true,
        },
      });
    });

    it('rejette si l’école est introuvable', async () => {
      prismaMock.ecole.findUnique.mockResolvedValue(null);

      await expect(service.findOne(ecoleId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCode', () => {
    it('retourne une école via son code', async () => {
      const ecole = {
        id: ecoleId,
        code: 'ECOLE-001',
        createur: { id: userId },
      };
      prismaMock.ecole.findUnique.mockResolvedValue(ecole);

      await expect(service.findByCode('ECOLE-001')).resolves.toEqual(ecole);
      expect(prismaMock.ecole.findUnique).toHaveBeenCalledWith({
        where: { code: 'ECOLE-001' },
        include: { createur: true },
      });
    });

    it('rejette si le code est introuvable', async () => {
      prismaMock.ecole.findUnique.mockResolvedValue(null);

      await expect(service.findByCode('UNKNOWN')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addMember', () => {
    it('rejette si l’utilisateur est introuvable', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.addMember(ecoleId, {
          userId,
          role: 'EMPLOYE',
          matricule: 'E-001',
          dateEmbauche: new Date(),
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('ajoute un employé à l’école', async () => {
      const txMock = {
        ecole: {
          findFirst: jest.fn().mockResolvedValue(null),
          update: jest.fn().mockResolvedValue(undefined),
        },
        employe: { upsert: jest.fn().mockResolvedValue({ id: 'emp-1' }) },
        user: {
          findUnique: jest.fn().mockResolvedValue({
            id: userId,
            clerkUserId: 'clerk-1',
            employe: null,
            parent: null,
            apprenant: null,
            ecole: [{ id: ecoleId, nom: 'Mon école' }],
          }),
        },
        parent: { upsert: jest.fn() },
        apprenant: { upsert: jest.fn() },
      };

      prismaMock.user.findUnique.mockResolvedValue({
        id: userId,
        clerkUserId: 'clerk-1',
      });
      prismaMock.$transaction.mockImplementation(
        (callback: (tx: typeof txMock) => unknown) => callback(txMock),
      );

      await expect(
        service.addMember(ecoleId, {
          userId,
          role: 'EMPLOYE',
          matricule: 'E-001',
          dateEmbauche: new Date(),
        }),
      ).resolves.toEqual({
        id: userId,
        clerkUserId: 'clerk-1',
        employe: null,
        parent: null,
        apprenant: null,
        ecole: [{ id: ecoleId, nom: 'Mon école' }],
      });
      expect(txMock.ecole.update).toHaveBeenCalledWith({
        where: { id: ecoleId },
        data: { user: { connect: { id: userId } } },
      });
      const upsertCall = txMock.employe.upsert.mock.calls[0] as [
        {
          where: { clerkUserId: string };
          create: {
            clerkUserId: string;
            matricule: string;
            dateEmbauche: Date;
            ecoleId: string;
          };
          update: {
            matricule: string;
            ecoleId: string;
          };
        },
      ];

      const [payload] = upsertCall;

      expect(payload.where).toEqual({ clerkUserId: 'clerk-1' });
      expect(payload.create).toEqual(
        expect.objectContaining({
          clerkUserId: 'clerk-1',
          matricule: 'E-001',
          ecoleId,
        }),
      );
      expect(payload.create.dateEmbauche).toBeInstanceOf(Date);
      expect(payload.update).toEqual({
        matricule: 'E-001',
        ecoleId,
      });
    });
  });

  describe('removeMember', () => {
    it('dissocie un membre de l’école', async () => {
      prismaMock.ecole.findUnique.mockResolvedValue({ id: ecoleId });
      prismaMock.ecole.update.mockResolvedValue({ id: ecoleId });

      await expect(service.removeMember(ecoleId, userId)).resolves.toEqual({
        id: ecoleId,
      });
      expect(prismaMock.ecole.update).toHaveBeenCalledWith({
        where: { id: ecoleId },
        data: {
          user: {
            disconnect: { id: userId },
          },
        },
      });
    });
  });
});
