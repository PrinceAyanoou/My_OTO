import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { AnneeScolaireService } from './annee-scolaire.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { anneescolaire_statut } from 'src/generated/prisma/enums';
describe('AnneeScolaireService', () => {
  let service: AnneeScolaireService;

  const prismaMock = {
    ecole: {
      findUnique: jest.fn(),
    },

    anneescolaire: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },

    $transaction: jest.fn(),
  };

  const ecoleId = 'ecole-123';
  const anneeScolaireId = 'annee-123';

  const baseAnnee = {
    id: anneeScolaireId,
    nom: '2025-2026',
    dateDebut: new Date('2025-09-01'),
    dateFin: new Date('2026-06-30'),
    statut: anneescolaire_statut.EN_PREPARATION,
    ecoleId,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnneeScolaireService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<AnneeScolaireService>(AnneeScolaireService);
  });

  //test pour create année scolaire
  describe('create', () => {
    const dto = {
      nom: '2025-2026',
      dateDebut: '2025-09-01',
      dateFin: '2026-06-30',
      statut: anneescolaire_statut.EN_PREPARATION,
    };

    it("devrait créer une année scolaire lorsque l'école existe", async () => {
      const createdAnnee = {
        ...baseAnnee,
      };

      prismaMock.ecole.findUnique.mockResolvedValue({
        id: ecoleId,
      });

      prismaMock.anneescolaire.findUnique.mockResolvedValue(null);

      prismaMock.$transaction.mockImplementation(
        async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
          callback(prismaMock),
      );

      prismaMock.anneescolaire.create.mockResolvedValue(createdAnnee);

      const result = await service.create(ecoleId, dto);

      expect(result).toEqual(createdAnnee);

      expect(prismaMock.ecole.findUnique).toHaveBeenCalledWith({
        where: { id: ecoleId },
      });

      expect(prismaMock.anneescolaire.findUnique).toHaveBeenCalledWith({
        where: {
          nom_ecoleId: {
            nom: dto.nom,
            ecoleId,
          },
        },
      });

      expect(prismaMock.anneescolaire.create).toHaveBeenCalledWith({
        data: {
          nom: dto.nom,
          statut: dto.statut,
          dateDebut: new Date(dto.dateDebut),
          dateFin: new Date(dto.dateFin),
          ecoleId,
        },
      });
    });

    it("devrait lever NotFoundException si l'école n'existe pas", async () => {
      prismaMock.ecole.findUnique.mockResolvedValue(null);

      await expect(service.create(ecoleId, dto)).rejects.toThrow(
        NotFoundException,
      );

      await expect(service.create(ecoleId, dto)).rejects.toThrow(
        'École introuvable.',
      );

      expect(prismaMock.anneescolaire.findUnique).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('devrait lever ConflictException si le nom existe déjà', async () => {
      prismaMock.ecole.findUnique.mockResolvedValue({
        id: ecoleId,
      });

      prismaMock.anneescolaire.findUnique.mockResolvedValue(baseAnnee);

      await expect(service.create(ecoleId, dto)).rejects.toThrow(
        ConflictException,
      );

      expect(prismaMock.$transaction).not.toHaveBeenCalled();
      expect(prismaMock.anneescolaire.create).not.toHaveBeenCalled();
    });

    it("devrait terminer l'ancienne année active si la nouvelle est EN_COURS", async () => {
      const currentDto = {
        ...dto,
        statut: anneescolaire_statut.EN_COURS,
      };

      prismaMock.ecole.findUnique.mockResolvedValue({
        id: ecoleId,
      });

      prismaMock.anneescolaire.findUnique.mockResolvedValue(null);

      prismaMock.$transaction.mockImplementation(
        async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
          callback(prismaMock),
      );

      prismaMock.anneescolaire.updateMany.mockResolvedValue({
        count: 1,
      });

      prismaMock.anneescolaire.create.mockResolvedValue({
        ...baseAnnee,
        statut: anneescolaire_statut.EN_COURS,
      });

      await service.create(ecoleId, currentDto);

      expect(prismaMock.anneescolaire.updateMany).toHaveBeenCalledWith({
        where: {
          ecoleId,
          statut: anneescolaire_statut.EN_COURS,
        },
        data: {
          statut: anneescolaire_statut.TERMINEE,
        },
      });

      expect(prismaMock.anneescolaire.create).toHaveBeenCalled();
    });

    it("ne devrait pas terminer d'ancienne année si le statut n'est pas EN_COURS", async () => {
      prismaMock.ecole.findUnique.mockResolvedValue({
        id: ecoleId,
      });

      prismaMock.anneescolaire.findUnique.mockResolvedValue(null);

      prismaMock.$transaction.mockImplementation(
        async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
          callback(prismaMock),
      );

      prismaMock.anneescolaire.create.mockResolvedValue(baseAnnee);

      await service.create(ecoleId, dto);

      expect(prismaMock.anneescolaire.updateMany).not.toHaveBeenCalled();
    });
  });

  //tests pour la récupérer toutes les années scolaire d'une école
  describe('findAll', () => {
    it('devrait retourner les années avec la pagination', async () => {
      const data = [baseAnnee];

      prismaMock.anneescolaire.findMany.mockResolvedValue(data);
      prismaMock.anneescolaire.count.mockResolvedValue(1);

      const query = {
        page: 1,
        limit: 10,
      };

      const result = await service.findAll(ecoleId, query);

      expect(result).toEqual({
        data,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      expect(prismaMock.anneescolaire.findMany).toHaveBeenCalledWith({
        where: {
          ecoleId,
        },
        skip: 0,
        take: 10,
        orderBy: {
          dateDebut: 'desc',
        },
        include: {
          _count: {
            select: {
              periodescolaire: true,
              inscription: true,
            },
          },
        },
      });

      expect(prismaMock.anneescolaire.count).toHaveBeenCalledWith({
        where: {
          ecoleId,
        },
      });
    });

    it('devrait utiliser page=1 et limit=10', async () => {
      prismaMock.anneescolaire.findMany.mockResolvedValue([]);
      prismaMock.anneescolaire.count.mockResolvedValue(0);

      await service.findAll(ecoleId, {
        page: 1,
        limit: 10,
      });

      expect(prismaMock.anneescolaire.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        }),
      );
    });

    it('devrait calculer correctement le skip', async () => {
      prismaMock.anneescolaire.findMany.mockResolvedValue([]);
      prismaMock.anneescolaire.count.mockResolvedValue(25);

      await service.findAll(ecoleId, {
        page: 3,
        limit: 10,
      });

      expect(prismaMock.anneescolaire.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });

    it('devrait appliquer le filtre statut', async () => {
      prismaMock.anneescolaire.findMany.mockResolvedValue([]);
      prismaMock.anneescolaire.count.mockResolvedValue(0);

      await service.findAll(ecoleId, {
        page: 1,
        limit: 10,
        statut: anneescolaire_statut.EN_COURS,
      });

      expect(prismaMock.anneescolaire.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            ecoleId,
            statut: anneescolaire_statut.EN_COURS,
          },
        }),
      );
    });

    it('devrait appliquer le filtre search', async () => {
      prismaMock.anneescolaire.findMany.mockResolvedValue([]);
      prismaMock.anneescolaire.count.mockResolvedValue(0);

      await service.findAll(ecoleId, {
        page: 1,
        limit: 10,
        search: '2025',
      });

      expect(prismaMock.anneescolaire.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            ecoleId,
            nom: {
              contains: '2025',
            },
          },
        }),
      );
    });

    it('devrait appliquer simultanément search et statut', async () => {
      prismaMock.anneescolaire.findMany.mockResolvedValue([]);
      prismaMock.anneescolaire.count.mockResolvedValue(0);

      await service.findAll(ecoleId, {
        page: 2,
        limit: 5,
        search: '2025',
        statut: anneescolaire_statut.EN_PREPARATION,
      });

      expect(prismaMock.anneescolaire.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            ecoleId,
            statut: anneescolaire_statut.EN_PREPARATION,
            nom: {
              contains: '2025',
            },
          },
          skip: 5,
          take: 5,
        }),
      );
    });

    it('devrait calculer correctement totalPages', async () => {
      prismaMock.anneescolaire.findMany.mockResolvedValue([]);
      prismaMock.anneescolaire.count.mockResolvedValue(21);

      const result = await service.findAll(ecoleId, {
        page: 1,
        limit: 10,
      });

      expect(result.meta.totalPages).toBe(3);
    });
  });

  //tests pour utrouver une année scolaire spécifique à une école
  describe('findOne', () => {
    it("devrait retourner l'année scolaire", async () => {
      const annee = {
        ...baseAnnee,
        periodescolaire: [],
        _count: {
          inscription: 5,
          affectationenseignant: 2,
          configurationscolarite: 1,
        },
      };

      prismaMock.anneescolaire.findFirst.mockResolvedValue(annee);

      const result = await service.findOne(ecoleId, anneeScolaireId);

      expect(result).toEqual(annee);

      expect(prismaMock.anneescolaire.findFirst).toHaveBeenCalledWith({
        where: {
          id: anneeScolaireId,
          ecoleId,
        },
        include: {
          periodescolaire: {
            orderBy: {
              ordre: 'asc',
            },
          },
          _count: {
            select: {
              inscription: true,
              affectationenseignant: true,
              configurationscolarite: true,
            },
          },
        },
      });
    });

    it("devrait lever NotFoundException si l'année n'existe pas", async () => {
      prismaMock.anneescolaire.findFirst.mockResolvedValue(null);

      await expect(service.findOne(ecoleId, anneeScolaireId)).rejects.toThrow(
        NotFoundException,
      );

      await expect(service.findOne(ecoleId, anneeScolaireId)).rejects.toThrow(
        'Année scolaire introuvable pour cette école.',
      );
    });

    it("ne devrait pas retourner une année d'une autre école", async () => {
      prismaMock.anneescolaire.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('autre-ecole', anneeScolaireId),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.anneescolaire.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: anneeScolaireId,
            ecoleId: 'autre-ecole',
          },
        }),
      );
    });
  });

  //tests pour trouver l'année scolaire en cours dans une école
  describe('findCurrent', () => {
    it("devrait retourner l'année scolaire active", async () => {
      const activeAnnee = {
        ...baseAnnee,
        statut: anneescolaire_statut.EN_COURS,
        periodescolaire: [],
      };

      prismaMock.anneescolaire.findFirst.mockResolvedValue(activeAnnee);

      const result = await service.findCurrent(ecoleId);

      expect(result).toEqual(activeAnnee);

      expect(prismaMock.anneescolaire.findFirst).toHaveBeenCalledWith({
        where: {
          ecoleId,
          statut: anneescolaire_statut.EN_COURS,
        },
        include: {
          periodescolaire: {
            orderBy: {
              ordre: 'asc',
            },
          },
        },
      });
    });

    it("devrait lever NotFoundException s'il n'y a aucune année active", async () => {
      prismaMock.anneescolaire.findFirst.mockResolvedValue(null);

      await expect(service.findCurrent(ecoleId)).rejects.toThrow(
        NotFoundException,
      );

      await expect(service.findCurrent(ecoleId)).rejects.toThrow(
        'Aucune année scolaire active pour cette école.',
      );
    });
  });

  //tests pour mettre à jour une année scolaire dans une école
  describe('update', () => {
    const updateDto = {
      nom: '2026-2027',
    };

    it('devrait mettre à jour une année scolaire', async () => {
      const currentAnnee = {
        ...baseAnnee,
      };

      const updatedAnnee = {
        ...baseAnnee,
        nom: '2026-2027',
      };

      prismaMock.anneescolaire.findFirst.mockResolvedValue(currentAnnee);
      prismaMock.anneescolaire.findUnique.mockResolvedValue(null);

      prismaMock.$transaction.mockImplementation(
        async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
          callback(prismaMock),
      );

      prismaMock.anneescolaire.update.mockResolvedValue(updatedAnnee);

      const result = await service.update(ecoleId, anneeScolaireId, updateDto);

      expect(result).toEqual(updatedAnnee);

      expect(prismaMock.anneescolaire.update).toHaveBeenCalledWith({
        where: {
          id: anneeScolaireId,
        },
        data: updateDto,
      });
    });

    it("devrait lever NotFoundException si l'année n'existe pas", async () => {
      prismaMock.anneescolaire.findFirst.mockResolvedValue(null);

      await expect(
        service.update(ecoleId, anneeScolaireId, updateDto),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('devrait vérifier les doublons lorsque le nom change', async () => {
      prismaMock.anneescolaire.findFirst.mockResolvedValue(baseAnnee);

      prismaMock.anneescolaire.findUnique.mockResolvedValue({
        ...baseAnnee,
        id: 'autre-annee',
        nom: '2026-2027',
      });

      await expect(
        service.update(ecoleId, anneeScolaireId, {
          nom: '2026-2027',
        }),
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('ne devrait pas vérifier les doublons si le nom ne change pas', async () => {
      prismaMock.anneescolaire.findFirst.mockResolvedValue(baseAnnee);

      prismaMock.$transaction.mockImplementation(
        async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
          callback(prismaMock),
      );

      prismaMock.anneescolaire.update.mockResolvedValue(baseAnnee);

      await service.update(ecoleId, anneeScolaireId, {
        nom: baseAnnee.nom,
      });

      expect(prismaMock.anneescolaire.findUnique).not.toHaveBeenCalled();
    });

    it('devrait terminer les autres années si le statut passe à EN_COURS', async () => {
      prismaMock.anneescolaire.findFirst.mockResolvedValue(baseAnnee);
      prismaMock.anneescolaire.findUnique.mockResolvedValue(null);

      prismaMock.$transaction.mockImplementation(
        async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
          callback(prismaMock),
      );

      prismaMock.anneescolaire.updateMany.mockResolvedValue({
        count: 1,
      });

      prismaMock.anneescolaire.update.mockResolvedValue({
        ...baseAnnee,
        statut: anneescolaire_statut.EN_COURS,
      });

      await service.update(ecoleId, anneeScolaireId, {
        statut: anneescolaire_statut.EN_COURS,
      });

      expect(prismaMock.anneescolaire.updateMany).toHaveBeenCalledWith({
        where: {
          ecoleId,
          statut: anneescolaire_statut.EN_COURS,
          id: {
            not: anneeScolaireId,
          },
        },
        data: {
          statut: anneescolaire_statut.TERMINEE,
        },
      });
    });

    it("ne devrait pas terminer les autres années si le statut n'est pas EN_COURS", async () => {
      prismaMock.anneescolaire.findFirst.mockResolvedValue(baseAnnee);

      prismaMock.$transaction.mockImplementation(
        async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
          callback(prismaMock),
      );

      prismaMock.anneescolaire.update.mockResolvedValue(baseAnnee);

      await service.update(ecoleId, anneeScolaireId, {
        statut: anneescolaire_statut.TERMINEE,
      });

      expect(prismaMock.anneescolaire.updateMany).not.toHaveBeenCalled();
    });
  });

  //tests pour modifier le statut d'une année scolaire
  describe('changeStatut', () => {
    it('devrait changer le statut', async () => {
      prismaMock.anneescolaire.findFirst.mockResolvedValue(baseAnnee);

      prismaMock.$transaction.mockImplementation(
        async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
          callback(prismaMock),
      );

      const updatedAnnee = {
        ...baseAnnee,
        statut: anneescolaire_statut.TERMINEE,
      };

      prismaMock.anneescolaire.update.mockResolvedValue(updatedAnnee);

      const result = await service.changeStatut(ecoleId, anneeScolaireId, {
        statut: anneescolaire_statut.TERMINEE,
      });

      expect(result).toEqual(updatedAnnee);

      expect(prismaMock.anneescolaire.update).toHaveBeenCalledWith({
        where: {
          id: anneeScolaireId,
        },
        data: {
          statut: anneescolaire_statut.TERMINEE,
        },
      });
    });

    it("devrait lever NotFoundException si l'année n'existe pas", async () => {
      prismaMock.anneescolaire.findFirst.mockResolvedValue(null);

      await expect(
        service.changeStatut(ecoleId, anneeScolaireId, {
          statut: anneescolaire_statut.TERMINEE,
        }),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('devrait terminer les autres années si le statut devient EN_COURS', async () => {
      prismaMock.anneescolaire.findFirst.mockResolvedValue(baseAnnee);

      prismaMock.$transaction.mockImplementation(
        async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
          callback(prismaMock),
      );

      prismaMock.anneescolaire.updateMany.mockResolvedValue({
        count: 1,
      });

      prismaMock.anneescolaire.update.mockResolvedValue({
        ...baseAnnee,
        statut: anneescolaire_statut.EN_COURS,
      });

      await service.changeStatut(ecoleId, anneeScolaireId, {
        statut: anneescolaire_statut.EN_COURS,
      });

      expect(prismaMock.anneescolaire.updateMany).toHaveBeenCalledWith({
        where: {
          ecoleId,
          statut: anneescolaire_statut.EN_COURS,
          id: {
            not: anneeScolaireId,
          },
        },
        data: {
          statut: anneescolaire_statut.TERMINEE,
        },
      });
    });

    it("ne devrait pas terminer les autres années si le statut n'est pas EN_COURS", async () => {
      prismaMock.anneescolaire.findFirst.mockResolvedValue(baseAnnee);

      prismaMock.$transaction.mockImplementation(
        async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
          callback(prismaMock),
      );

      prismaMock.anneescolaire.update.mockResolvedValue({
        ...baseAnnee,
        statut: anneescolaire_statut.TERMINEE,
      });

      await service.changeStatut(ecoleId, anneeScolaireId, {
        statut: anneescolaire_statut.TERMINEE,
      });

      expect(prismaMock.anneescolaire.updateMany).not.toHaveBeenCalled();
    });
  });

  //tests pour supprimer une année scolaire
  describe('remove', () => {
    it('devrait supprimer une année scolaire', async () => {
      prismaMock.anneescolaire.findFirst.mockResolvedValue({
        ...baseAnnee,
        statut: anneescolaire_statut.TERMINEE,
      });

      prismaMock.anneescolaire.deleteMany.mockResolvedValue({
        count: 1,
      });

      const result = await service.remove(ecoleId, anneeScolaireId);

      expect(result).toEqual({
        message: 'Année scolaire supprimée avec succès.',
      });

      expect(prismaMock.anneescolaire.deleteMany).toHaveBeenCalledWith({
        where: {
          id: anneeScolaireId,
          ecoleId,
        },
      });
    });

    it("devrait refuser la suppression d'une année EN_COURS", async () => {
      prismaMock.anneescolaire.findFirst.mockResolvedValue({
        ...baseAnnee,
        statut: anneescolaire_statut.EN_COURS,
      });

      await expect(service.remove(ecoleId, anneeScolaireId)).rejects.toThrow(
        BadRequestException,
      );

      await expect(service.remove(ecoleId, anneeScolaireId)).rejects.toThrow(
        'Impossible de supprimer cette année scolaire car elle est en cours.',
      );

      expect(prismaMock.anneescolaire.deleteMany).not.toHaveBeenCalled();
    });

    it("devrait lever NotFoundException si l'année n'existe pas", async () => {
      prismaMock.anneescolaire.findFirst.mockResolvedValue(null);

      await expect(service.remove(ecoleId, anneeScolaireId)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaMock.anneescolaire.deleteMany).not.toHaveBeenCalled();
    });

    it('devrait lever NotFoundException si deleteMany ne supprime rien', async () => {
      prismaMock.anneescolaire.findFirst.mockResolvedValue({
        ...baseAnnee,
        statut: anneescolaire_statut.TERMINEE,
      });

      prismaMock.anneescolaire.deleteMany.mockResolvedValue({
        count: 0,
      });

      await expect(service.remove(ecoleId, anneeScolaireId)).rejects.toThrow(
        NotFoundException,
      );

      await expect(service.remove(ecoleId, anneeScolaireId)).rejects.toThrow(
        'Année scolaire introuvable pour cette école.',
      );
    });

    it("devrait supprimer uniquement dans l'école concernée", async () => {
      prismaMock.anneescolaire.findFirst.mockResolvedValue({
        ...baseAnnee,
        statut: anneescolaire_statut.TERMINEE,
      });

      prismaMock.anneescolaire.deleteMany.mockResolvedValue({
        count: 1,
      });

      await service.remove(ecoleId, anneeScolaireId);

      expect(prismaMock.anneescolaire.deleteMany).toHaveBeenCalledWith({
        where: {
          id: anneeScolaireId,
          ecoleId,
        },
      });
    });
  });
});
