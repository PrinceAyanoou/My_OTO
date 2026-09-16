import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';

import { AffectationEnseignantService } from './affectation-enseignant.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AffectationEnseignantService', () => {
  let service: AffectationEnseignantService;

  const prismaMock = {
    employe: {
      findFirst: jest.fn(),
    },
    classscolaire: {
      findFirst: jest.fn(),
    },
    matiere: {
      findFirst: jest.fn(),
    },
    anneescolaire: {
      findFirst: jest.fn(),
    },
    affectationenseignant: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const ecoleId = 'ecole-123';
  const affectationId = 'affectation-123';

  const dtoCreate = {
    employeId: 'employe-123',
    classeScolaireId: 'classe-123',
    matiereId: 'matiere-123',
    anneeScolaireId: 'annee-123',
  };

  const dtoUpdate = {
    matiereId: 'matiere-456',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AffectationEnseignantService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<AffectationEnseignantService>(
      AffectationEnseignantService,
    );
  });

  // ============================================================
  // CREATE
  // ============================================================

  describe('create', () => {
    it('devrait créer une affectation avec succès', async () => {
      const createdAffectation = {
        id: affectationId,
        ...dtoCreate,
      };

      // Validation des entités
      prismaMock.employe.findFirst.mockResolvedValue({
        id: dtoCreate.employeId,
        ecoleId,
      });

      prismaMock.classscolaire.findFirst.mockResolvedValue({
        id: dtoCreate.classeScolaireId,
      });

      prismaMock.matiere.findFirst.mockResolvedValue({
        id: dtoCreate.matiereId,
        ecoleId,
      });

      prismaMock.anneescolaire.findFirst.mockResolvedValue({
        id: dtoCreate.anneeScolaireId,
        ecoleId,
      });

      prismaMock.affectationenseignant.create.mockResolvedValue(
        createdAffectation,
      );

      const result = await service.create(ecoleId, dtoCreate);

      expect(result).toEqual(createdAffectation);

      expect(prismaMock.employe.findFirst).toHaveBeenCalledWith({
        where: {
          id: dtoCreate.employeId,
          ecoleId,
        },
      });

      expect(prismaMock.classscolaire.findFirst).toHaveBeenCalledWith({
        where: {
          id: dtoCreate.classeScolaireId,
          niveauscolaire: {
            ecoleId,
          },
        },
      });

      expect(prismaMock.matiere.findFirst).toHaveBeenCalledWith({
        where: {
          id: dtoCreate.matiereId,
          ecoleId,
        },
      });

      expect(prismaMock.anneescolaire.findFirst).toHaveBeenCalledWith({
        where: {
          id: dtoCreate.anneeScolaireId,
          ecoleId,
        },
      });

      expect(prismaMock.affectationenseignant.create).toHaveBeenCalled();
    });

    it('devrait lever NotFoundException si l’employé est introuvable', async () => {
      prismaMock.employe.findFirst.mockResolvedValue(null);

      await expect(service.create(ecoleId, dtoCreate)).rejects.toThrow(
        new NotFoundException('Employé introuvable pour cette école.'),
      );

      expect(prismaMock.affectationenseignant.create).not.toHaveBeenCalled();
    });

    it('devrait lever NotFoundException si la classe est introuvable', async () => {
      prismaMock.employe.findFirst.mockResolvedValue({
        id: dtoCreate.employeId,
        ecoleId,
      });

      prismaMock.classscolaire.findFirst.mockResolvedValue(null);

      prismaMock.matiere.findFirst.mockResolvedValue({
        id: dtoCreate.matiereId,
        ecoleId,
      });

      prismaMock.anneescolaire.findFirst.mockResolvedValue({
        id: dtoCreate.anneeScolaireId,
        ecoleId,
      });

      await expect(service.create(ecoleId, dtoCreate)).rejects.toThrow(
        new NotFoundException('Classe introuvable pour cette école.'),
      );

      expect(prismaMock.affectationenseignant.create).not.toHaveBeenCalled();
    });

    it('devrait lever NotFoundException si la matière est introuvable', async () => {
      prismaMock.employe.findFirst.mockResolvedValue({
        id: dtoCreate.employeId,
        ecoleId,
      });

      prismaMock.classscolaire.findFirst.mockResolvedValue({
        id: dtoCreate.classeScolaireId,
      });

      prismaMock.matiere.findFirst.mockResolvedValue(null);

      prismaMock.anneescolaire.findFirst.mockResolvedValue({
        id: dtoCreate.anneeScolaireId,
        ecoleId,
      });

      await expect(service.create(ecoleId, dtoCreate)).rejects.toThrow(
        new NotFoundException('Matière introuvable pour cette école.'),
      );

      expect(prismaMock.affectationenseignant.create).not.toHaveBeenCalled();
    });

    it('devrait lever NotFoundException si l’année scolaire est introuvable', async () => {
      prismaMock.employe.findFirst.mockResolvedValue({
        id: dtoCreate.employeId,
        ecoleId,
      });

      prismaMock.classscolaire.findFirst.mockResolvedValue({
        id: dtoCreate.classeScolaireId,
      });

      prismaMock.matiere.findFirst.mockResolvedValue({
        id: dtoCreate.matiereId,
        ecoleId,
      });

      prismaMock.anneescolaire.findFirst.mockResolvedValue(null);

      await expect(service.create(ecoleId, dtoCreate)).rejects.toThrow(
        new NotFoundException('Année scolaire introuvable pour cette école.'),
      );

      expect(prismaMock.affectationenseignant.create).not.toHaveBeenCalled();
    });

    it('devrait lever ConflictException si une affectation existe déjà', async () => {
      prismaMock.employe.findFirst.mockResolvedValue({
        id: dtoCreate.employeId,
        ecoleId,
      });

      prismaMock.classscolaire.findFirst.mockResolvedValue({
        id: dtoCreate.classeScolaireId,
      });

      prismaMock.matiere.findFirst.mockResolvedValue({
        id: dtoCreate.matiereId,
        ecoleId,
      });

      prismaMock.anneescolaire.findFirst.mockResolvedValue({
        id: dtoCreate.anneeScolaireId,
        ecoleId,
      });

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: 'test',
        },
      );

      prismaMock.affectationenseignant.create.mockRejectedValue(prismaError);

      await expect(service.create(ecoleId, dtoCreate)).rejects.toThrow(
        new ConflictException(
          'Une affectation existe déjà pour cette matière dans cette classe pour cette année scolaire.',
        ),
      );
    });

    it('devrait relancer une erreur Prisma différente de P2002', async () => {
      prismaMock.employe.findFirst.mockResolvedValue({
        id: dtoCreate.employeId,
        ecoleId,
      });

      prismaMock.classscolaire.findFirst.mockResolvedValue({
        id: dtoCreate.classeScolaireId,
      });

      prismaMock.matiere.findFirst.mockResolvedValue({
        id: dtoCreate.matiereId,
        ecoleId,
      });

      prismaMock.anneescolaire.findFirst.mockResolvedValue({
        id: dtoCreate.anneeScolaireId,
        ecoleId,
      });

      const error = new Error('Erreur Prisma');

      prismaMock.affectationenseignant.create.mockRejectedValue(error);

      await expect(service.create(ecoleId, dtoCreate)).rejects.toThrow(error);
    });
  });

  // ============================================================
  // FIND ALL
  // ============================================================

  describe('findAll', () => {
    it('devrait retourner les affectations avec pagination', async () => {
      const items = [
        {
          id: 'affectation-1',
          employeId: 'employe-1',
          classeScolaireId: 'classe-1',
          matiereId: 'matiere-1',
          anneeScolaireId: 'annee-1',
        },
        {
          id: 'affectation-2',
          employeId: 'employe-2',
          classeScolaireId: 'classe-2',
          matiereId: 'matiere-2',
          anneeScolaireId: 'annee-1',
        },
      ];

      prismaMock.affectationenseignant.findMany.mockResolvedValue(items);

      prismaMock.affectationenseignant.count.mockResolvedValue(25);

      const query = {
        page: 2,
        limit: 10,
      };

      const result = await service.findAll(ecoleId, query);

      expect(result).toEqual({
        data: items,
        meta: {
          total: 25,
          page: 2,
          limit: 10,
          totalPages: 3,
        },
      });

      expect(prismaMock.affectationenseignant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        }),
      );

      expect(prismaMock.affectationenseignant.count).toHaveBeenCalled();
    });

    it('devrait utiliser page=1 et limit=10 par défaut', async () => {
      prismaMock.affectationenseignant.findMany.mockResolvedValue([]);

      prismaMock.affectationenseignant.count.mockResolvedValue(0);

      const result = await service.findAll(ecoleId, {});

      expect(result).toEqual({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      });

      expect(prismaMock.affectationenseignant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        }),
      );
    });

    it('devrait appliquer les filtres fournis', async () => {
      prismaMock.affectationenseignant.findMany.mockResolvedValue([]);

      prismaMock.affectationenseignant.count.mockResolvedValue(1);

      const query = {
        page: 1,
        limit: 10,
        employeId: 'employe-123',
        classeScolaireId: 'classe-123',
        matiereId: 'matiere-123',
        anneeScolaireId: 'annee-123',
      };

      await service.findAll(ecoleId, query);

      const expectedWhere = {
        employe: {
          ecoleId,
        },
        employeId: 'employe-123',
        classeScolaireId: 'classe-123',
        matiereId: 'matiere-123',
        anneeScolaireId: 'annee-123',
      };

      expect(prismaMock.affectationenseignant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expectedWhere,
        }),
      );

      expect(prismaMock.affectationenseignant.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
    });
  });

  // ============================================================
  // FIND ONE
  // ============================================================

  describe('findOne', () => {
    it('devrait retourner une affectation existante', async () => {
      const affectation = {
        id: affectationId,
        employeId: 'employe-123',
        classeScolaireId: 'classe-123',
        matiereId: 'matiere-123',
        anneeScolaireId: 'annee-123',
      };

      prismaMock.affectationenseignant.findFirst.mockResolvedValue(affectation);

      const result = await service.findOne(ecoleId, affectationId);

      expect(result).toEqual(affectation);

      expect(prismaMock.affectationenseignant.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: affectationId,
            employe: {
              ecoleId,
            },
          },
        }),
      );
    });

    it('devrait lever NotFoundException si l’affectation est introuvable', async () => {
      prismaMock.affectationenseignant.findFirst.mockResolvedValue(null);

      await expect(service.findOne(ecoleId, affectationId)).rejects.toThrow(
        new NotFoundException(
          `L'affectation avec l'ID ${affectationId} est introuvable pour cette école.`,
        ),
      );
    });
  });

  // ============================================================
  // UPDATE
  // ============================================================

  describe('update', () => {
    const currentAffectation = {
      id: affectationId,
      employeId: 'employe-123',
      classeScolaireId: 'classe-123',
      matiereId: 'matiere-123',
      anneeScolaireId: 'annee-123',
    };

    it('devrait modifier une affectation avec succès', async () => {
      const updatedAffectation = {
        ...currentAffectation,
        matiereId: 'matiere-456',
      };

      // findOne()
      prismaMock.affectationenseignant.findFirst.mockResolvedValueOnce(
        currentAffectation,
      );

      // Validation de la nouvelle matière
      prismaMock.matiere.findFirst.mockResolvedValue({
        id: 'matiere-456',
        ecoleId,
      });

      // Vérification du conflit
      prismaMock.affectationenseignant.findFirst.mockResolvedValueOnce(null);

      prismaMock.affectationenseignant.update.mockResolvedValue(
        updatedAffectation,
      );

      const result = await service.update(ecoleId, affectationId, dtoUpdate);

      expect(result).toEqual(updatedAffectation);

      expect(prismaMock.affectationenseignant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: affectationId,
          },
          data: dtoUpdate,
        }),
      );
    });

    it('devrait lever NotFoundException si l’affectation à modifier n’existe pas', async () => {
      prismaMock.affectationenseignant.findFirst.mockResolvedValue(null);

      await expect(
        service.update(ecoleId, affectationId, dtoUpdate),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.affectationenseignant.update).not.toHaveBeenCalled();
    });

    it('devrait lever ConflictException si les nouveaux paramètres existent déjà', async () => {
      prismaMock.affectationenseignant.findFirst.mockResolvedValueOnce(
        currentAffectation,
      );

      prismaMock.matiere.findFirst.mockResolvedValue({
        id: 'matiere-456',
        ecoleId,
      });

      prismaMock.affectationenseignant.findFirst.mockResolvedValueOnce({
        id: 'autre-affectation',
        matiereId: 'matiere-456',
        classeScolaireId: 'classe-123',
        anneeScolaireId: 'annee-123',
      });

      await expect(
        service.update(ecoleId, affectationId, dtoUpdate),
      ).rejects.toThrow(
        new ConflictException(
          'Une autre affectation existe déjà pour ces paramètres.',
        ),
      );

      expect(prismaMock.affectationenseignant.update).not.toHaveBeenCalled();
    });

    it('devrait pouvoir modifier uniquement un champ sans vérifier les doublons', async () => {
      const dto = {
        employeId: 'employe-456',
      };

      const updated = {
        ...currentAffectation,
        employeId: 'employe-456',
      };

      prismaMock.affectationenseignant.findFirst.mockResolvedValueOnce(
        currentAffectation,
      );

      prismaMock.employe.findFirst.mockResolvedValue({
        id: 'employe-456',
        ecoleId,
      });

      prismaMock.affectationenseignant.update.mockResolvedValue(updated);

      const result = await service.update(ecoleId, affectationId, dto);

      expect(result).toEqual(updated);

      expect(prismaMock.affectationenseignant.update).toHaveBeenCalled();

      // Pas de recherche de doublon car seuls
      // employeId est modifié.
      expect(prismaMock.affectationenseignant.findFirst).toHaveBeenCalledTimes(
        1,
      );
    });
  });

  // ============================================================
  // REMOVE
  // ============================================================

  describe('remove', () => {
    it('devrait supprimer une affectation avec succès', async () => {
      const affectation = {
        id: affectationId,
        employeId: 'employe-123',
        classeScolaireId: 'classe-123',
        matiereId: 'matiere-123',
        anneeScolaireId: 'annee-123',
      };

      prismaMock.affectationenseignant.findFirst.mockResolvedValue(affectation);

      prismaMock.affectationenseignant.delete.mockResolvedValue(affectation);

      const result = await service.remove(ecoleId, affectationId);

      expect(result).toEqual({
        message: 'Affectation supprimée avec succès.',
      });

      expect(prismaMock.affectationenseignant.delete).toHaveBeenCalledWith({
        where: {
          id: affectationId,
        },
      });
    });

    it('ne devrait pas supprimer si l’affectation est introuvable', async () => {
      prismaMock.affectationenseignant.findFirst.mockResolvedValue(null);

      await expect(service.remove(ecoleId, affectationId)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaMock.affectationenseignant.delete).not.toHaveBeenCalled();
    });
  });
});
