import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AnnonceService } from './annonce.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AnnonceService', () => {
  let service: AnnonceService;

  // Typage strict pour éviter les avertissements ESLint '@typescript-eslint/no-unsafe-return'
  const prismaMock = {
    employe: {
      findFirst: jest.fn<Promise<unknown>, [unknown]>(),
    },
    annonce: {
      create: jest.fn<Promise<unknown>, [unknown]>(),
      findMany: jest.fn<Promise<unknown>, [unknown]>(),
      findFirst: jest.fn<Promise<unknown>, [unknown]>(),
      update: jest.fn<Promise<unknown>, [unknown]>(),
      delete: jest.fn<Promise<unknown>, [unknown]>(),
    },
    cibleannonce: {
      deleteMany: jest.fn<Promise<unknown>, [unknown]>(),
      createMany: jest.fn<Promise<unknown>, [unknown]>(),
    },
    $transaction: jest.fn<
      Promise<unknown>,
      [(tx: unknown) => Promise<unknown>]
    >(),
  };

  const ecoleId = 'ecole-123';
  const annonceId = 'annonce-123';
  const auteurId = 'employe-123';

  const annonceMock = {
    id: annonceId,
    titre: 'Réunion de rentrée',
    contenu: 'La réunion aura lieu lundi.',
    datePublication: new Date('2026-09-01T10:00:00.000Z'),
    dateExpiration: new Date('2026-10-01T10:00:00.000Z'),
    ecoleId,
    auteurId,
    employe: {
      id: auteurId,
      user: {
        id: 'user-123',
      },
    },
    cibleannonce: [],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnonceService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<AnnonceService>(AnnonceService);
  });

  describe('create', () => {
    const dto = {
      titre: 'Réunion de rentrée',
      contenu: 'La réunion aura lieu lundi.',
      auteurId,
      cibles: [
        {
          public: 'TOUS' as const,
          classeScolaireId: undefined,
        },
      ],
    };

    it('devrait créer une annonce avec succès', async () => {
      prismaMock.employe.findFirst.mockResolvedValue({ id: auteurId });
      prismaMock.annonce.create.mockResolvedValue(annonceMock);

      const result = await service.create(dto, ecoleId);

      expect(prismaMock.employe.findFirst).toHaveBeenCalledWith({
        where: { id: auteurId, ecoleId },
        select: { id: true },
      });
      expect(prismaMock.annonce.create).toHaveBeenCalledTimes(1);

      const createCall = prismaMock.annonce.create.mock.calls[0][0] as {
        data: {
          titre: string;
          contenu: string;
          ecoleId: string;
          auteurId: string;
          dateExpiration: Date;
          cibleannonce: {
            create: Array<{ public: string; classeScolaireId: null }>;
          };
        };
        include: {
          employe: { include: { user: boolean } };
          cibleannonce: boolean;
        };
      };

      expect(createCall.data).toEqual(
        expect.objectContaining({
          titre: dto.titre,
          contenu: dto.contenu,
          ecoleId,
          auteurId,
          cibleannonce: {
            create: [
              {
                public: 'TOUS',
                classeScolaireId: null,
              },
            ],
          },
        }),
      );
      expect(createCall.data.dateExpiration).toBeInstanceOf(Date);
      expect(createCall.include).toEqual({
        employe: {
          include: {
            user: true,
          },
        },
        cibleannonce: true,
      });
      expect(result).toEqual(annonceMock);
    });

    it("devrait utiliser une date d'expiration de 30 jours par défaut", async () => {
      prismaMock.employe.findFirst.mockResolvedValue({ id: auteurId });
      prismaMock.annonce.create.mockResolvedValue(annonceMock);

      const before = Date.now();
      await service.create(dto, ecoleId);
      const after = Date.now();

      const createCall = prismaMock.annonce.create.mock.calls[0][0] as {
        data: { dateExpiration: Date };
      };
      const dateExpiration = createCall.data.dateExpiration;
      const expectedMin = before + 30 * 24 * 60 * 60 * 1000;
      const expectedMax = after + 30 * 24 * 60 * 60 * 1000;

      expect(dateExpiration.getTime()).toBeGreaterThanOrEqual(expectedMin);
      expect(dateExpiration.getTime()).toBeLessThanOrEqual(expectedMax);
    });

    it("devrait utiliser la date d'expiration fournie", async () => {
      prismaMock.employe.findFirst.mockResolvedValue({ id: auteurId });
      prismaMock.annonce.create.mockResolvedValue(annonceMock);

      const dtoWithExpiration = {
        ...dto,
        dateExpiration: '2026-12-31T10:00:00.000Z',
      };

      await service.create(dtoWithExpiration, ecoleId);

      const createCall = prismaMock.annonce.create.mock.calls[0][0] as {
        data: { dateExpiration: Date };
      };
      expect(createCall.data.dateExpiration).toEqual(
        new Date('2026-12-31T10:00:00.000Z'),
      );
    });

    it('devrait accepter plusieurs cibles', async () => {
      prismaMock.employe.findFirst.mockResolvedValue({ id: auteurId });
      prismaMock.annonce.create.mockResolvedValue(annonceMock);

      const dtoWithTargets = {
        ...dto,
        cibles: [
          { public: 'TOUS' as const, classeScolaireId: undefined },
          { public: 'PARENT' as const, classeScolaireId: 'classe-123' },
        ],
      };

      await service.create(dtoWithTargets, ecoleId);

      const createCall = prismaMock.annonce.create.mock.calls[0][0] as {
        data: { cibleannonce: { create: unknown } };
      };
      expect(createCall.data.cibleannonce.create).toEqual([
        { public: 'TOUS', classeScolaireId: null },
        { public: 'PARENT', classeScolaireId: 'classe-123' },
      ]);
    });

    it("devrait lever NotFoundException si l'auteur n'existe pas dans l'école", async () => {
      prismaMock.employe.findFirst.mockResolvedValue(null);

      await expect(service.create(dto, ecoleId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.annonce.create).not.toHaveBeenCalled();
    });

    it("devrait lever BadRequestException si la date d'expiration est antérieure à la publication", async () => {
      prismaMock.employe.findFirst.mockResolvedValue({ id: auteurId });
      const dtoWithInvalidDate = {
        ...dto,
        dateExpiration: '2020-01-01T10:00:00.000Z',
      };

      await expect(service.create(dtoWithInvalidDate, ecoleId)).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaMock.annonce.create).not.toHaveBeenCalled();
    });

    it("devrait lever BadRequestException si la date d'expiration est égale à la date de publication", async () => {
      prismaMock.employe.findFirst.mockResolvedValue({ id: auteurId });
      const now = new Date();
      const dtoWithInvalidDate = {
        ...dto,
        dateExpiration: now.toISOString(),
      };

      await expect(service.create(dtoWithInvalidDate, ecoleId)).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaMock.annonce.create).not.toHaveBeenCalled();
    });
  });

  describe('findAllBySchool', () => {
    it("devrait retourner toutes les annonces de l'école", async () => {
      prismaMock.annonce.findMany.mockResolvedValue([annonceMock]);

      const result = await service.findAllBySchool(ecoleId);

      expect(prismaMock.annonce.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ecoleId },
          include: {
            employe: { include: { user: true } },
            cibleannonce: true,
          },
          orderBy: { datePublication: 'desc' },
        }),
      );
      expect(result).toEqual([annonceMock]);
    });

    it('devrait filtrer uniquement les annonces actives', async () => {
      prismaMock.annonce.findMany.mockResolvedValue([annonceMock]);

      const before = Date.now();
      await service.findAllBySchool(ecoleId, true);
      const after = Date.now();

      const call = prismaMock.annonce.findMany.mock.calls[0][0] as {
        where: { ecoleId: string; dateExpiration: { gte: Date } };
      };
      expect(call.where.ecoleId).toBe(ecoleId);
      expect(call.where.dateExpiration.gte).toBeInstanceOf(Date);
      expect(call.where.dateExpiration.gte.getTime()).toBeGreaterThanOrEqual(
        before,
      );
      expect(call.where.dateExpiration.gte.getTime()).toBeLessThanOrEqual(
        after,
      );
    });

    it('ne devrait pas appliquer le filtre actif par défaut', async () => {
      prismaMock.annonce.findMany.mockResolvedValue([]);

      await service.findAllBySchool(ecoleId);

      const call = prismaMock.annonce.findMany.mock.calls[0][0] as {
        where: unknown;
      };
      expect(call.where).toEqual({ ecoleId });
    });

    it('devrait accepter explicitement onlyActive=false', async () => {
      prismaMock.annonce.findMany.mockResolvedValue([]);

      await service.findAllBySchool(ecoleId, false);

      const call = prismaMock.annonce.findMany.mock.calls[0][0] as {
        where: unknown;
      };
      expect(call.where).toEqual({ ecoleId });
    });
  });

  describe('findOne', () => {
    it('devrait retourner une annonce existante', async () => {
      prismaMock.annonce.findFirst.mockResolvedValue(annonceMock);

      const result = await service.findOne(annonceId, ecoleId);

      expect(prismaMock.annonce.findFirst).toHaveBeenCalledWith({
        where: { id: annonceId, ecoleId },
        include: {
          employe: { include: { user: true } },
          cibleannonce: true,
        },
      });
      expect(result).toEqual(annonceMock);
    });

    it("devrait lever NotFoundException si l'annonce n'existe pas", async () => {
      prismaMock.annonce.findFirst.mockResolvedValue(null);

      await expect(service.findOne(annonceId, ecoleId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("ne devrait pas retourner une annonce d'une autre école", async () => {
      prismaMock.annonce.findFirst.mockResolvedValue(null);

      await expect(service.findOne(annonceId, 'autre-ecole')).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.annonce.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: annonceId, ecoleId: 'autre-ecole' },
        }),
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      titre: 'Nouveau titre',
      contenu: 'Nouveau contenu',
    };

    beforeEach(() => {
      prismaMock.annonce.findFirst.mockResolvedValue(annonceMock);
    });

    it('devrait modifier une annonce sans modifier les cibles', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) =>
        callback(prismaMock),
      );
      prismaMock.annonce.update.mockResolvedValue({
        ...annonceMock,
        ...updateDto,
      });

      const result = await service.update(annonceId, updateDto, ecoleId);

      expect(prismaMock.annonce.findFirst).toHaveBeenCalled();
      expect(prismaMock.cibleannonce.deleteMany).not.toHaveBeenCalled();
      expect(prismaMock.cibleannonce.createMany).not.toHaveBeenCalled();
      expect(prismaMock.annonce.update).toHaveBeenCalledWith({
        where: { id: annonceId },
        data: updateDto,
        include: {
          employe: { include: { user: true } },
          cibleannonce: true,
        },
      });
      expect(result).toEqual({ ...annonceMock, ...updateDto });
    });

    it('devrait modifier les cibles lorsqu elles sont fournies', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) =>
        callback(prismaMock),
      );
      prismaMock.annonce.update.mockResolvedValue(annonceMock);

      const dtoWithCibles = {
        titre: 'Nouveau titre',
        cibles: [
          { public: 'TOUS' as const, classeScolaireId: undefined },
          { public: 'PARENT' as const, classeScolaireId: 'classe-123' },
        ],
      };

      await service.update(annonceId, dtoWithCibles, ecoleId);

      expect(prismaMock.cibleannonce.deleteMany).toHaveBeenCalledWith({
        where: { annonceId },
      });
      expect(prismaMock.cibleannonce.createMany).toHaveBeenCalledWith({
        data: [
          { annonceId, public: 'TOUS', classeScolaireId: null },
          { annonceId, public: 'PARENT', classeScolaireId: 'classe-123' },
        ],
      });
    });

    it("devrait modifier la date d'expiration", async () => {
      prismaMock.$transaction.mockImplementation(async (callback) =>
        callback(prismaMock),
      );
      prismaMock.annonce.update.mockResolvedValue(annonceMock);

      const newExpiration = '2026-12-31T10:00:00.000Z';
      const dto = { dateExpiration: newExpiration };

      await service.update(annonceId, dto, ecoleId);

      expect(prismaMock.annonce.update).toHaveBeenCalledWith({
        where: { id: annonceId },
        data: { dateExpiration: new Date(newExpiration) },
        include: {
          employe: { include: { user: true } },
          cibleannonce: true,
        },
      });
    });

    it("devrait lever BadRequestException si la nouvelle date d'expiration est invalide", async () => {
      const dto = { dateExpiration: '2020-01-01T10:00:00.000Z' };

      await expect(service.update(annonceId, dto, ecoleId)).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
      expect(prismaMock.annonce.update).not.toHaveBeenCalled();
    });

    it("devrait lever NotFoundException si l'annonce n'existe pas", async () => {
      prismaMock.annonce.findFirst.mockResolvedValue(null);

      await expect(
        service.update(annonceId, updateDto, ecoleId),
      ).rejects.toThrow(NotFoundException);
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('ne devrait pas supprimer les anciennes cibles si cibles est un tableau vide', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) =>
        callback(prismaMock),
      );
      prismaMock.annonce.update.mockResolvedValue(annonceMock);

      const dto = { titre: 'Titre modifié', cibles: [] };

      await service.update(annonceId, dto, ecoleId);

      expect(prismaMock.cibleannonce.deleteMany).not.toHaveBeenCalled();
      expect(prismaMock.cibleannonce.createMany).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      prismaMock.annonce.findFirst.mockResolvedValue(annonceMock);
    });

    it('devrait supprimer une annonce avec succès', async () => {
      prismaMock.annonce.delete.mockResolvedValue(annonceMock);

      const result = await service.remove(annonceId, ecoleId);

      expect(prismaMock.annonce.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: annonceId, ecoleId },
        }),
      );
      expect(prismaMock.annonce.delete).toHaveBeenCalledWith({
        where: { id: annonceId },
      });
      expect(result).toEqual({
        message: 'Annonce supprimée avec succès.',
      });
    });

    it("devrait lever NotFoundException si l'annonce n'existe pas", async () => {
      prismaMock.annonce.findFirst.mockResolvedValue(null);

      await expect(service.remove(annonceId, ecoleId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.annonce.delete).not.toHaveBeenCalled();
    });
  });
});
