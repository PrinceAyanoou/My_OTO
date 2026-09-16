import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ClasseMatiereService } from './classe-matirere.service';

describe('ClasseMatiereService', () => {
  let service: ClasseMatiereService;

  const ecoleId = '550e8400-e29b-41d4-a716-446655440000';
  const classeId = '660e8400-e29b-41d4-a716-446655440000';
  const matiereId = '770e8400-e29b-41d4-a716-446655440000';
  const ueId = '880e8400-e29b-41d4-a716-446655440000';
  const relationId = '990e8400-e29b-41d4-a716-446655440000';

  const prismaMock = {
    ecole: { findUnique: jest.fn() },
    classscolaire: { findFirst: jest.fn() },
    matiere: { findFirst: jest.fn() },
    uniteenseignement: { findUnique: jest.fn() },
    classematirere: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const relation = {
    id: relationId,
    classeScolaireId: classeId,
    matiereId,
    uniteEnseignementId: ueId,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClasseMatiereService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get<ClasseMatiereService>(ClasseMatiereService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      classeScolaireId: classeId,
      matiereId,
      uniteEnseignementId: ueId,
      coefficient: 2,
    };

    beforeEach(() => {
      prismaMock.classscolaire.findFirst.mockResolvedValue({ id: classeId });
      prismaMock.matiere.findFirst.mockResolvedValue({ id: matiereId });
      prismaMock.uniteenseignement.findUnique.mockResolvedValue({ id: ueId });
      prismaMock.classematirere.findFirst.mockResolvedValue(null);
      prismaMock.classematirere.create.mockResolvedValue(relation);
    });

    it('valide les relations et crée l’association', async () => {
      await expect(service.create(ecoleId, dto)).resolves.toBe(relation);
      expect(prismaMock.classematirere.create).toHaveBeenCalledWith({
        data: dto,
        include: {
          classscolaire: true,
          matiere: true,
          uniteenseignement: true,
        },
      });
    });

    it('refuse une classe absente ou hors école', async () => {
      prismaMock.classscolaire.findFirst.mockResolvedValue(null);
      await expect(service.create(ecoleId, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaMock.classematirere.create).not.toHaveBeenCalled();
    });

    it('refuse une matière absente ou hors école', async () => {
      prismaMock.matiere.findFirst.mockResolvedValue(null);
      await expect(service.create(ecoleId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('refuse une unité d’enseignement absente', async () => {
      prismaMock.uniteenseignement.findUnique.mockResolvedValue(null);
      await expect(service.create(ecoleId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('refuse une association déjà existante', async () => {
      prismaMock.classematirere.findFirst.mockResolvedValue(relation);
      await expect(service.create(ecoleId, dto)).rejects.toThrow(
        ConflictException,
      );
      expect(prismaMock.classematirere.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('retourne les associations avec pagination', async () => {
      const data = [relation];
      prismaMock.ecole.findUnique.mockResolvedValue({ id: ecoleId });
      prismaMock.classematirere.findMany.mockResolvedValue(data);
      prismaMock.classematirere.count.mockResolvedValue(21);

      await expect(
        service.findAll(ecoleId, { page: 2, limit: 10 }),
      ).resolves.toEqual({
        data,
        meta: { total: 21, page: 2, limit: 10, totalPages: 3 },
      });
      expect(prismaMock.classematirere.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });

    it('refuse une école inexistante', async () => {
      prismaMock.ecole.findUnique.mockResolvedValue(null);
      await expect(
        service.findAll(ecoleId, { page: 1, limit: 10 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne, update et remove', () => {
    it('retourne une association de l’école', async () => {
      prismaMock.classematirere.findFirst.mockResolvedValue(relation);
      await expect(service.findOne(ecoleId, relationId)).resolves.toBe(
        relation,
      );
    });

    it('lève une erreur si l’association est introuvable', async () => {
      prismaMock.classematirere.findFirst.mockResolvedValue(null);
      await expect(service.findOne(ecoleId, relationId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('met à jour une association existante', async () => {
      const dto = { coefficient: 3 };
      const updated = { ...relation, coefficient: 3 };
      prismaMock.classematirere.findFirst.mockResolvedValue(relation);
      prismaMock.classematirere.update.mockResolvedValue(updated);

      await expect(service.update(ecoleId, relationId, dto)).resolves.toBe(
        updated,
      );
      expect(prismaMock.classematirere.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: relationId }, data: dto }),
      );
    });

    it('refuse une nouvelle association déjà utilisée', async () => {
      const dto = { matiereId: 'aa0e8400-e29b-41d4-a716-446655440000' };
      prismaMock.classematirere.findFirst
        .mockResolvedValueOnce(relation)
        .mockResolvedValueOnce({ id: 'another-relation' });
      prismaMock.classscolaire.findFirst.mockResolvedValue({ id: classeId });
      prismaMock.matiere.findFirst.mockResolvedValue({ id: dto.matiereId });

      await expect(service.update(ecoleId, relationId, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('supprime une association existante', async () => {
      prismaMock.classematirere.findFirst.mockResolvedValue(relation);
      prismaMock.classematirere.delete.mockResolvedValue(relation);

      await expect(service.remove(ecoleId, relationId)).resolves.toBe(relation);
      expect(prismaMock.classematirere.delete).toHaveBeenCalledWith({
        where: { id: relationId },
      });
    });
  });
});
