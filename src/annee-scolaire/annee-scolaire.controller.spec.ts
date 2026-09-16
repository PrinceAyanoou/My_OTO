import { Test, TestingModule } from '@nestjs/testing';

import { AnneeScolaireController } from './annee-scolaire.controller';
import { AnneeScolaireService } from './annee-scolaire.service';

import { ClerkAuthGuard } from 'src/auth/guards/clerk-auth.guard';
import { PoliciesGuard } from 'src/auth/guards/permissions.guard';

import { anneescolaire_statut } from 'src/generated/prisma/enums';

describe('AnneeScolaireController', () => {
  let controller: AnneeScolaireController;

  const serviceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findCurrent: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    changeStatut: jest.fn(),
    remove: jest.fn(),
  };

  const ecoleId = 'ecole-123';
  const anneeScolaireId = 'annee-123';

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnneeScolaireController],
      providers: [
        {
          provide: AnneeScolaireService,
          useValue: serviceMock,
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .overrideGuard(PoliciesGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();

    controller = module.get<AnneeScolaireController>(AnneeScolaireController);
  });

  describe('Controller', () => {
    it('devrait être défini', () => {
      expect(controller).toBeDefined();
    });
  });

  //create
  describe('create', () => {
    const dto = {
      nom: '2025-2026',
      dateDebut: '2025-09-01',
      dateFin: '2026-06-30',
      statut: anneescolaire_statut.EN_PREPARATION,
    };

    it('devrait appeler le service create avec ecoleId et dto', async () => {
      const expectedResult = {
        id: anneeScolaireId,
        ecoleId,
        ...dto,
      };

      serviceMock.create.mockResolvedValue(expectedResult);

      const result = await controller.create(ecoleId, dto);

      expect(result).toEqual(expectedResult);

      expect(serviceMock.create).toHaveBeenCalledTimes(1);
      expect(serviceMock.create).toHaveBeenCalledWith(ecoleId, dto);
    });

    it('devrait retourner exactement le résultat du service', async () => {
      const serviceResult = {
        id: anneeScolaireId,
        nom: '2025-2026',
        ecoleId,
      };

      serviceMock.create.mockResolvedValue(serviceResult);

      const result = await controller.create(ecoleId, dto);

      expect(result).toBe(serviceResult);
    });
  });

  //findall
  describe('findAll', () => {
    it('devrait appeler le service findAll avec ecoleId et query', async () => {
      const query = {
        page: 1,
        limit: 10,
      };

      const expectedResult = {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };

      serviceMock.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(ecoleId, query);

      expect(result).toEqual(expectedResult);

      expect(serviceMock.findAll).toHaveBeenCalledTimes(1);
      expect(serviceMock.findAll).toHaveBeenCalledWith(ecoleId, query);
    });

    it('devrait transmettre les filtres au service', async () => {
      const query = {
        page: 2,
        limit: 5,
        search: '2025',
        statut: anneescolaire_statut.EN_COURS,
      };

      serviceMock.findAll.mockResolvedValue({
        data: [],
        meta: {
          total: 0,
          page: 2,
          limit: 5,
          totalPages: 0,
        },
      });

      await controller.findAll(ecoleId, query);

      expect(serviceMock.findAll).toHaveBeenCalledTimes(1);

      expect(serviceMock.findAll).toHaveBeenCalledWith(ecoleId, query);
    });
  });

  //find actuel
  describe('findCurrent', () => {
    it('devrait appeler le service findCurrent avec ecoleId', async () => {
      const expectedResult = {
        id: anneeScolaireId,
        nom: '2025-2026',
        statut: anneescolaire_statut.EN_COURS,
        ecoleId,
        periodescolaire: [],
      };

      serviceMock.findCurrent.mockResolvedValue(expectedResult);

      const result = await controller.findCurrent(ecoleId);

      expect(result).toEqual(expectedResult);

      expect(serviceMock.findCurrent).toHaveBeenCalledTimes(1);
      expect(serviceMock.findCurrent).toHaveBeenCalledWith(ecoleId);
    });

    it('devrait retourner exactement le résultat du service', async () => {
      const serviceResult = {
        id: anneeScolaireId,
        statut: anneescolaire_statut.EN_COURS,
      };

      serviceMock.findCurrent.mockResolvedValue(serviceResult);

      const result = await controller.findCurrent(ecoleId);

      expect(result).toBe(serviceResult);
    });
  });

  //find one
  describe('findOne', () => {
    it("devrait appeler le service findOne avec l'école et l'année", async () => {
      const expectedResult = {
        id: anneeScolaireId,
        nom: '2025-2026',
        ecoleId,
        periodescolaire: [],
        _count: {
          inscription: 10,
          affectationenseignant: 3,
          configurationscolarite: 1,
        },
      };

      serviceMock.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(ecoleId, anneeScolaireId);

      expect(result).toEqual(expectedResult);

      expect(serviceMock.findOne).toHaveBeenCalledTimes(1);
      expect(serviceMock.findOne).toHaveBeenCalledWith(
        ecoleId,
        anneeScolaireId,
      );
    });
  });

  //update
  describe('update', () => {
    it('devrait appeler le service update avec les bons paramètres', async () => {
      const dto = {
        nom: '2026-2027',
      };

      const expectedResult = {
        id: anneeScolaireId,
        nom: '2026-2027',
        ecoleId,
      };

      serviceMock.update.mockResolvedValue(expectedResult);

      const result = await controller.update(ecoleId, anneeScolaireId, dto);

      expect(result).toEqual(expectedResult);

      expect(serviceMock.update).toHaveBeenCalledTimes(1);
      expect(serviceMock.update).toHaveBeenCalledWith(
        ecoleId,
        anneeScolaireId,
        dto,
      );
    });

    it('devrait transmettre le DTO complet au service', async () => {
      const dto = {
        nom: '2026-2027',
        dateDebut: '2026-09-01',
        dateFin: '2027-06-30',
        statut: anneescolaire_statut.EN_PREPARATION,
      };

      serviceMock.update.mockResolvedValue({
        id: anneeScolaireId,
        ...dto,
      });

      await controller.update(ecoleId, anneeScolaireId, dto);

      expect(serviceMock.update).toHaveBeenCalledTimes(1);

      expect(serviceMock.update).toHaveBeenCalledWith(
        ecoleId,
        anneeScolaireId,
        dto,
      );
    });
  });

  //modifier le statut
  describe('changeStatut', () => {
    it('devrait appeler le service changeStatut avec les bons paramètres', async () => {
      const dto = {
        statut: anneescolaire_statut.EN_COURS,
      };

      const expectedResult = {
        id: anneeScolaireId,
        nom: '2025-2026',
        ecoleId,
        statut: anneescolaire_statut.EN_COURS,
      };

      serviceMock.changeStatut.mockResolvedValue(expectedResult);

      const result = await controller.changeStatut(
        ecoleId,
        anneeScolaireId,
        dto,
      );

      expect(result).toEqual(expectedResult);

      expect(serviceMock.changeStatut).toHaveBeenCalledTimes(1);

      expect(serviceMock.changeStatut).toHaveBeenCalledWith(
        ecoleId,
        anneeScolaireId,
        dto,
      );
    });

    it('devrait transmettre le DTO de changement de statut', async () => {
      const dto = {
        statut: anneescolaire_statut.TERMINEE,
      };

      serviceMock.changeStatut.mockResolvedValue({
        id: anneeScolaireId,
        statut: anneescolaire_statut.TERMINEE,
      });

      await controller.changeStatut(ecoleId, anneeScolaireId, dto);

      expect(serviceMock.changeStatut).toHaveBeenCalledTimes(1);

      expect(serviceMock.changeStatut).toHaveBeenCalledWith(
        ecoleId,
        anneeScolaireId,
        dto,
      );
    });
  });

  //supprimer
  describe('remove', () => {
    it('devrait appeler le service remove avec ecoleId et anneeScolaireId', async () => {
      const expectedResult = {
        message: 'Année scolaire supprimée avec succès.',
      };

      serviceMock.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(ecoleId, anneeScolaireId);

      expect(result).toEqual(expectedResult);

      expect(serviceMock.remove).toHaveBeenCalledTimes(1);

      expect(serviceMock.remove).toHaveBeenCalledWith(ecoleId, anneeScolaireId);
    });

    it('devrait retourner exactement le résultat du service', async () => {
      const serviceResult = {
        message: 'Suppression réussie',
      };

      serviceMock.remove.mockResolvedValue(serviceResult);

      const result = await controller.remove(ecoleId, anneeScolaireId);

      expect(result).toBe(serviceResult);
    });
  });
});
