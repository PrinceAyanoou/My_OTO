import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigurationScolariteService } from './configuration-scolarite.service';

describe('ConfigurationScolariteService', () => {
  let service: ConfigurationScolariteService;

  const ecoleId = '550e8400-e29b-41d4-a716-446655440000';
  const niveauId = '660e8400-e29b-41d4-a716-446655440000';
  const anneeId = '770e8400-e29b-41d4-a716-446655440000';
  const configId = '880e8400-e29b-41d4-a716-446655440000';

  const prismaMock = {
    niveauscolaire: { findFirst: jest.fn() },
    anneescolaire: { findFirst: jest.fn() },
    ecole: { findUnique: jest.fn() },
    configurationscolarite: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const configuration = {
    id: configId,
    nom: 'Configuration 2026',
    estActive: true,
    ecoleId,
    niveauScolaireId: niveauId,
    anneeScolaireId: anneeId,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigurationScolariteService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get<ConfigurationScolariteService>(
      ConfigurationScolariteService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      nom: 'Configuration 2026',
      niveauScolaireId: niveauId,
      anneeScolaireId: anneeId,
      estActive: true,
    };

    beforeEach(() => {
      prismaMock.niveauscolaire.findFirst.mockResolvedValue({ id: niveauId });
      prismaMock.anneescolaire.findFirst.mockResolvedValue({ id: anneeId });
      prismaMock.configurationscolarite.findUnique.mockResolvedValue(null);
      prismaMock.configurationscolarite.create.mockResolvedValue(configuration);
    });

    it('valide les relations et crée la configuration', async () => {
      await expect(service.create(ecoleId, dto)).resolves.toBe(configuration);
      expect(prismaMock.configurationscolarite.create).toHaveBeenCalledWith({
        data: {
          nom: dto.nom,
          estActive: true,
          ecoleId,
          niveauScolaireId: niveauId,
          anneeScolaireId: anneeId,
        },
        include: {
          niveauscolaire: true,
          anneescolaire: true,
          tranchescolarite: true,
        },
      });
    });

    it('refuse un niveau absent ou hors école', async () => {
      prismaMock.niveauscolaire.findFirst.mockResolvedValue(null);
      await expect(service.create(ecoleId, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaMock.configurationscolarite.create).not.toHaveBeenCalled();
    });

    it('refuse une année absente ou hors école', async () => {
      prismaMock.anneescolaire.findFirst.mockResolvedValue(null);
      await expect(service.create(ecoleId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('refuse une configuration déjà existante', async () => {
      prismaMock.configurationscolarite.findUnique.mockResolvedValue(
        configuration,
      );
      await expect(service.create(ecoleId, dto)).rejects.toThrow(
        ConflictException,
      );
      expect(prismaMock.configurationscolarite.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('retourne les configurations avec filtres et pagination', async () => {
      const data = [configuration];
      prismaMock.ecole.findUnique.mockResolvedValue({ id: ecoleId });
      prismaMock.configurationscolarite.findMany.mockResolvedValue(data);
      prismaMock.configurationscolarite.count.mockResolvedValue(21);

      await expect(
        service.findAll(ecoleId, {
          niveauScolaireId: niveauId,
          estActive: true,
          page: 2,
          limit: 10,
        }),
      ).resolves.toEqual({
        data,
        meta: { total: 21, page: 2, limit: 10, totalPages: 3 },
      });
      expect(prismaMock.configurationscolarite.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });

    it('refuse une école inexistante', async () => {
      prismaMock.ecole.findUnique.mockResolvedValue(null);
      await expect(
        service.findAll(ecoleId, {
          page: 1,
          limit: 10,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne, update et remove', () => {
    it('retourne une configuration de l’école', async () => {
      prismaMock.ecole.findUnique.mockResolvedValue({ id: ecoleId });
      prismaMock.configurationscolarite.findFirst.mockResolvedValue(
        configuration,
      );
      await expect(service.findOne(ecoleId, configId)).resolves.toBe(
        configuration,
      );
    });

    it('lève une erreur si la configuration est introuvable', async () => {
      prismaMock.ecole.findUnique.mockResolvedValue({ id: ecoleId });
      prismaMock.configurationscolarite.findFirst.mockResolvedValue(null);
      await expect(service.findOne(ecoleId, configId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('met à jour une configuration existante', async () => {
      const dto = { nom: 'Configuration modifiée' };
      const updated = { ...configuration, ...dto };
      prismaMock.ecole.findUnique.mockResolvedValue({ id: ecoleId });
      prismaMock.configurationscolarite.findFirst.mockResolvedValue(
        configuration,
      );
      prismaMock.configurationscolarite.update.mockResolvedValue(updated);

      await expect(service.update(ecoleId, configId, dto)).resolves.toBe(
        updated,
      );
      expect(prismaMock.configurationscolarite.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: configId }, data: dto }),
      );
    });

    it('refuse une nouvelle combinaison déjà utilisée', async () => {
      const newNiveauId = '990e8400-e29b-41d4-a716-446655440000';
      const dto = { niveauScolaireId: newNiveauId };
      prismaMock.ecole.findUnique.mockResolvedValue({ id: ecoleId });
      prismaMock.configurationscolarite.findFirst.mockResolvedValue(
        configuration,
      );
      prismaMock.niveauscolaire.findFirst.mockResolvedValue({
        id: newNiveauId,
      });
      prismaMock.anneescolaire.findFirst.mockResolvedValue({ id: anneeId });
      prismaMock.configurationscolarite.findUnique.mockResolvedValue({
        id: 'another-config',
      });

      await expect(service.update(ecoleId, configId, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('supprime une configuration existante', async () => {
      prismaMock.ecole.findUnique.mockResolvedValue({ id: ecoleId });
      prismaMock.configurationscolarite.findFirst.mockResolvedValue(
        configuration,
      );
      prismaMock.configurationscolarite.delete.mockResolvedValue(configuration);

      await expect(service.remove(ecoleId, configId)).resolves.toBe(
        configuration,
      );
      expect(prismaMock.configurationscolarite.delete).toHaveBeenCalledWith({
        where: { id: configId },
      });
    });
  });
});
