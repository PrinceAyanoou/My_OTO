import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ApprenantParentService } from './apprenant-parent.service';

describe('ApprenantParentService', () => {
  let service: ApprenantParentService;

  const parentId = '550e8400-e29b-41d4-a716-446655440000';
  const apprenantId = '660e8400-e29b-41d4-a716-446655440000';
  const ecoleId = '770e8400-e29b-41d4-a716-446655440000';

  const prismaMock = {
    parent: {
      findUnique: jest.fn(),
    },
    apprenant: {
      findFirst: jest.fn(),
    },
    apprenantparent: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprenantParentService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ApprenantParentService>(ApprenantParentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('linkApprenant', () => {
    const dto = {
      apprenantId,
      lien: 'PERE' as const,
    };

    beforeEach(() => {
      prismaMock.parent.findUnique.mockResolvedValue({ id: parentId });
      prismaMock.apprenant.findFirst.mockResolvedValue({ id: apprenantId });
      prismaMock.apprenantparent.findUnique.mockResolvedValue(null);
    });

    it('devrait refuser la liaison si le parent est introuvable', async () => {
      prismaMock.parent.findUnique.mockResolvedValue(null);

      await expect(
        service.linkApprenant(parentId, dto, ecoleId),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.apprenant.findFirst).not.toHaveBeenCalled();
    });

    it("devrait refuser la liaison si l'apprenant n'est pas dans l'école", async () => {
      prismaMock.apprenant.findFirst.mockResolvedValue(null);

      await expect(
        service.linkApprenant(parentId, dto, ecoleId),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.apprenantparent.findUnique).not.toHaveBeenCalled();
    });

    it('devrait vérifier l’école de l’apprenant', async () => {
      await service.linkApprenant(parentId, dto, ecoleId);

      expect(prismaMock.apprenant.findFirst).toHaveBeenCalledWith({
        where: {
          id: apprenantId,
          inscription: {
            some: {
              anneescolaire: { ecoleId },
            },
          },
        },
        select: { id: true },
      });
    });

    it('devrait refuser une liaison déjà existante', async () => {
      prismaMock.apprenantparent.findUnique.mockResolvedValue({
        parentId,
      });

      await expect(
        service.linkApprenant(parentId, dto, ecoleId),
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.apprenantparent.create).not.toHaveBeenCalled();
    });

    it('devrait créer la liaison avec le parent et le lien de parenté', async () => {
      const createdLink = {
        parentId,
        apprenantId,
        lien: 'PERE',
      };
      prismaMock.apprenantparent.create.mockResolvedValue(createdLink);

      const result = await service.linkApprenant(parentId, dto, ecoleId);

      expect(prismaMock.apprenantparent.create).toHaveBeenCalledWith({
        data: {
          parentId,
          apprenantId,
          lien: 'PERE',
        },
        include: {
          apprenant: { include: { user: true } },
          parent: { include: { user: true } },
        },
      });
      expect(result).toBe(createdLink);
    });
  });

  describe('unlinkApprenant', () => {
    beforeEach(() => {
      prismaMock.apprenant.findFirst.mockResolvedValue({ id: apprenantId });
      prismaMock.apprenantparent.findUnique.mockResolvedValue({ parentId });
    });

    it("devrait refuser la suppression si l'apprenant n'est pas dans l'école", async () => {
      prismaMock.apprenant.findFirst.mockResolvedValue(null);

      await expect(
        service.unlinkApprenant(parentId, apprenantId, ecoleId),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.apprenantparent.findUnique).not.toHaveBeenCalled();
    });

    it("devrait refuser la suppression si la liaison n'existe pas", async () => {
      prismaMock.apprenantparent.findUnique.mockResolvedValue(null);

      await expect(
        service.unlinkApprenant(parentId, apprenantId, ecoleId),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.apprenantparent.delete).not.toHaveBeenCalled();
    });

    it('devrait supprimer la liaison existante', async () => {
      const deletedLink = { parentId, apprenantId, lien: 'PERE' };
      prismaMock.apprenantparent.delete.mockResolvedValue(deletedLink);

      const result = await service.unlinkApprenant(
        parentId,
        apprenantId,
        ecoleId,
      );

      expect(prismaMock.apprenantparent.delete).toHaveBeenCalledWith({
        where: {
          apprenantId_parentId: {
            apprenantId,
            parentId,
          },
        },
      });
      expect(result).toBe(deletedLink);
    });
  });
});
