import { Test, TestingModule } from '@nestjs/testing';

import { AffectationEnseignantController } from './affectation-enseignant.controller';
import { AffectationEnseignantService } from './affectation-enseignant.service';

import { ClerkAuthGuard } from 'src/auth/guards/clerk-auth.guard';
import { PoliciesGuard } from 'src/auth/guards/permissions.guard';

describe('AffectationEnseignantController', () => {
  let controller: AffectationEnseignantController;

  const serviceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const ecoleId = 'ecole-123';
  const affectationId = 'affectation-123';

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AffectationEnseignantController],

      providers: [
        {
          provide: AffectationEnseignantService,
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

    controller = module.get<AffectationEnseignantController>(
      AffectationEnseignantController,
    );
  });

  describe('Controller', () => {
    it('devrait être défini', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('create', () => {
    it('devrait appeler le service create avec ecoleId et dto', async () => {
      const dto = {
        employeId: 'employe-123',
        classeScolaireId: 'classe-123',
        matiereId: 'matiere-123',
        anneeScolaireId: 'annee-123',
      };

      const expectedResult = {
        id: affectationId,
        ...dto,
      };

      serviceMock.create.mockResolvedValue(expectedResult);

      const result = await controller.create(ecoleId, dto);

      expect(result).toEqual(expectedResult);

      expect(serviceMock.create).toHaveBeenCalledTimes(1);

      expect(serviceMock.create).toHaveBeenCalledWith(ecoleId, dto);
    });

    it('devrait retourner exactement le résultat du service', async () => {
      const dto = {
        employeId: 'employe-123',
        classeScolaireId: 'classe-123',
        matiereId: 'matiere-123',
        anneeScolaireId: 'annee-123',
      };

      const serviceResult = {
        id: affectationId,
        employeId: dto.employeId,
        classeScolaireId: dto.classeScolaireId,
        matiereId: dto.matiereId,
        anneeScolaireId: dto.anneeScolaireId,
      };

      serviceMock.create.mockResolvedValue(serviceResult);

      const result = await controller.create(ecoleId, dto);

      expect(result).toBe(serviceResult);
    });
  });

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
        limit: 20,
        employeId: 'employe-123',
        classeScolaireId: 'classe-123',
        matiereId: 'matiere-123',
        anneeScolaireId: 'annee-123',
      };

      const expectedResult = {
        data: [],
        meta: {
          total: 0,
          page: 2,
          limit: 20,
          totalPages: 0,
        },
      };

      serviceMock.findAll.mockResolvedValue(expectedResult);

      await controller.findAll(ecoleId, query);

      expect(serviceMock.findAll).toHaveBeenCalledTimes(1);

      expect(serviceMock.findAll).toHaveBeenCalledWith(ecoleId, query);
    });
  });

  describe('findOne', () => {
    it('devrait appeler le service findOne avec ecoleId et id', async () => {
      const expectedResult = {
        id: affectationId,
        employeId: 'employe-123',
        classeScolaireId: 'classe-123',
        matiereId: 'matiere-123',
        anneeScolaireId: 'annee-123',
      };

      serviceMock.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(ecoleId, affectationId);

      expect(result).toEqual(expectedResult);

      expect(serviceMock.findOne).toHaveBeenCalledTimes(1);

      expect(serviceMock.findOne).toHaveBeenCalledWith(ecoleId, affectationId);
    });
  });

  describe('update', () => {
    it('devrait appeler le service update avec les bons paramètres', async () => {
      const dto = {
        matiereId: 'matiere-456',
      };

      const expectedResult = {
        id: affectationId,
        employeId: 'employe-123',
        classeScolaireId: 'classe-123',
        matiereId: 'matiere-456',
        anneeScolaireId: 'annee-123',
      };

      serviceMock.update.mockResolvedValue(expectedResult);

      const result = await controller.update(ecoleId, affectationId, dto);

      expect(result).toEqual(expectedResult);

      expect(serviceMock.update).toHaveBeenCalledTimes(1);

      expect(serviceMock.update).toHaveBeenCalledWith(
        ecoleId,
        affectationId,
        dto,
      );
    });

    it('devrait transmettre le DTO complet au service', async () => {
      const dto = {
        employeId: 'employe-456',
        classeScolaireId: 'classe-456',
        matiereId: 'matiere-456',
        anneeScolaireId: 'annee-456',
      };

      const expectedResult = {
        id: affectationId,
        ...dto,
      };

      serviceMock.update.mockResolvedValue(expectedResult);

      const result = await controller.update(ecoleId, affectationId, dto);

      expect(result).toEqual(expectedResult);

      expect(serviceMock.update).toHaveBeenCalledTimes(1);

      expect(serviceMock.update).toHaveBeenCalledWith(
        ecoleId,
        affectationId,
        dto,
      );
    });
  });

  describe('remove', () => {
    it('devrait appeler le service remove avec ecoleId et id', async () => {
      const expectedResult = {
        message: 'Affectation supprimée avec succès.',
      };

      serviceMock.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(ecoleId, affectationId);

      expect(result).toEqual(expectedResult);

      expect(serviceMock.remove).toHaveBeenCalledTimes(1);

      expect(serviceMock.remove).toHaveBeenCalledWith(ecoleId, affectationId);
    });
  });
});
