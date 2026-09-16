import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ClasseScolaireService } from './classe-scolaire.service';

describe('ClasseScolaireService', () => {
  let service: ClasseScolaireService;

  const niveauId = '550e8400-e29b-41d4-a716-446655440000';
  const classeId = '660e8400-e29b-41d4-a716-446655440000';
  const ecoleId = '770e8400-e29b-41d4-a716-446655440000';

  const prismaMock = {
    niveauscolaire: { findUnique: jest.fn() },
    classscolaire: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    ecole: { findUnique: jest.fn() },
  };

  const classe = {
    id: classeId,
    nom: '6e A',
    capacite: 40,
    niveauScolaireId: niveauId,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClasseScolaireService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get<ClasseScolaireService>(ClasseScolaireService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = { nom: '6e A', capacite: 40 };

    beforeEach(() => {
      prismaMock.niveauscolaire.findUnique.mockResolvedValue({ id: niveauId });
      prismaMock.classscolaire.findFirst.mockResolvedValue(null);
      prismaMock.classscolaire.create.mockResolvedValue(classe);
    });

    it('crée une classe lorsque le niveau existe', async () => {
      await expect(service.create(niveauId, dto)).resolves.toBe(classe);
      expect(prismaMock.classscolaire.create).toHaveBeenCalledWith({
        data: {
          nom: '6e A',
          capacite: 40,
          niveauScolaireId: niveauId,
        },
        include: {
          niveauscolaire: {
            select: { id: true, nom: true },
          },
        },
      });
    });

    it('refuse un niveau inexistant', async () => {
      prismaMock.niveauscolaire.findUnique.mockResolvedValue(null);

      await expect(service.create(niveauId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.classscolaire.create).not.toHaveBeenCalled();
    });

    it('refuse une classe homonyme dans le même niveau', async () => {
      prismaMock.classscolaire.findFirst.mockResolvedValue(classe);

      await expect(service.create(niveauId, dto)).rejects.toThrow(
        ConflictException,
      );
      expect(prismaMock.classscolaire.create).not.toHaveBeenCalled();
    });
  });

  describe('findAllByNiveau', () => {
    it('retourne les classes du niveau avec pagination par défaut', async () => {
      const data = [classe];
      prismaMock.niveauscolaire.findUnique.mockResolvedValue({ id: niveauId });
      prismaMock.classscolaire.findMany.mockResolvedValue(data);
      prismaMock.classscolaire.count.mockResolvedValue(21);

      await expect(service.findAllByNiveau(niveauId)).resolves.toEqual({
        data,
        meta: { total: 21, page: 1, limit: 10, totalPages: 3 },
      });
      expect(prismaMock.classscolaire.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { niveauScolaireId: niveauId },
          skip: 0,
          take: 10,
        }),
      );
    });

    it('applique la recherche sur le nom', async () => {
      prismaMock.niveauscolaire.findUnique.mockResolvedValue({ id: niveauId });
      prismaMock.classscolaire.findMany.mockResolvedValue([]);
      prismaMock.classscolaire.count.mockResolvedValue(0);

      await service.findAllByNiveau(niveauId, { search: '  6e  ' });

      expect(prismaMock.classscolaire.count).toHaveBeenCalledWith({
        where: {
          niveauScolaireId: niveauId,
          nom: { contains: '6e' },
        },
      });
    });

    it('refuse un niveau inexistant', async () => {
      prismaMock.niveauscolaire.findUnique.mockResolvedValue(null);

      await expect(service.findAllByNiveau(niveauId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAllByEcole', () => {
    it('retourne les classes d’une école', async () => {
      const data = [classe];
      prismaMock.ecole.findUnique.mockResolvedValue({ id: ecoleId });
      prismaMock.classscolaire.findMany.mockResolvedValue(data);
      prismaMock.classscolaire.count.mockResolvedValue(1);

      await expect(service.findAllByEcole(ecoleId)).resolves.toEqual({
        data,
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });
      expect(prismaMock.classscolaire.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { niveauscolaire: { ecoleId } },
        }),
      );
    });

    it('refuse une école inexistante', async () => {
      prismaMock.ecole.findUnique.mockResolvedValue(null);

      await expect(service.findAllByEcole(ecoleId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne, update et remove', () => {
    it('retourne une classe du niveau demandé', async () => {
      prismaMock.classscolaire.findFirst.mockResolvedValue(classe);

      await expect(service.findOne(niveauId, classeId)).resolves.toBe(classe);
    });

    it('lève une erreur si la classe est introuvable', async () => {
      prismaMock.classscolaire.findFirst.mockResolvedValue(null);

      await expect(service.findOne(niveauId, classeId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('met à jour une classe existante', async () => {
      const dto = { nom: '6e B', capacite: 45 };
      const updated = { ...classe, ...dto };
      prismaMock.classscolaire.findFirst.mockResolvedValue(classe);
      prismaMock.classscolaire.update.mockResolvedValue(updated);

      await expect(service.update(niveauId, classeId, dto)).resolves.toBe(
        updated,
      );
      expect(prismaMock.classscolaire.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: classeId },
          data: dto,
        }),
      );
    });

    it('refuse un nouveau nom déjà utilisé', async () => {
      prismaMock.classscolaire.findFirst
        .mockResolvedValueOnce(classe)
        .mockResolvedValueOnce({ id: 'another-class', nom: '6e B' });

      await expect(
        service.update(niveauId, classeId, { nom: '6e B' }),
      ).rejects.toThrow(ConflictException);
      expect(prismaMock.classscolaire.update).not.toHaveBeenCalled();
    });

    it('supprime une classe existante', async () => {
      prismaMock.classscolaire.findFirst.mockResolvedValue(classe);
      prismaMock.classscolaire.delete.mockResolvedValue(classe);

      await expect(service.remove(niveauId, classeId)).resolves.toBe(classe);
      expect(prismaMock.classscolaire.delete).toHaveBeenCalledWith({
        where: { id: classeId },
      });
    });
  });
});
