import { Test, TestingModule } from '@nestjs/testing';
import { ApprenantController } from './apprenant.controller';
import { ApprenantService } from './apprenant.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';

describe('ApprenantController', () => {
  let controller: ApprenantController;

  const apprenantServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const ecoleId = '550e8400-e29b-41d4-a716-446655440000';
  const apprenantId = '660e8400-e29b-41d4-a716-446655440000';

  const apprenantMock = {
    id: apprenantId,
    nom: 'DOE',
    prenom: 'John',
    ecoleId,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApprenantController],
      providers: [
        {
          provide: ApprenantService,
          useValue: apprenantServiceMock,
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ApprenantController>(ApprenantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('devrait appeler le service avec le DTO et ecoleId', async () => {
      const dto = {
        nom: 'DOE',
        prenom: 'John',
      };

      apprenantServiceMock.create.mockResolvedValue(apprenantMock);

      const result = await controller.create(ecoleId, dto as never);

      expect(apprenantServiceMock.create).toHaveBeenCalledTimes(1);
      expect(apprenantServiceMock.create).toHaveBeenCalledWith(dto, ecoleId);
      expect(result).toEqual(apprenantMock);
    });

    it('devrait retourner exactement le résultat du service', async () => {
      const dto = {
        nom: 'DUPONT',
        prenom: 'Marie',
      };

      const serviceResult = {
        id: apprenantId,
        nom: 'DUPONT',
        prenom: 'Marie',
      };

      apprenantServiceMock.create.mockResolvedValue(serviceResult);

      const result = await controller.create(ecoleId, dto as never);

      expect(result).toBe(serviceResult);
    });
  });

  describe('findAll', () => {
    it('devrait appeler le service avec query et ecoleId', async () => {
      const query = {
        page: 1,
        limit: 10,
      };

      const serviceResult = {
        data: [apprenantMock],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      apprenantServiceMock.findAll.mockResolvedValue(serviceResult);

      const result = await controller.findAll(ecoleId, query);

      expect(apprenantServiceMock.findAll).toHaveBeenCalledTimes(1);
      expect(apprenantServiceMock.findAll).toHaveBeenCalledWith(query, ecoleId);
      expect(result).toEqual(serviceResult);
    });

    it('devrait transmettre correctement les filtres', async () => {
      const query = {
        page: 2,
        limit: 20,
        search: 'John',
      };

      apprenantServiceMock.findAll.mockResolvedValue([]);

      await controller.findAll(ecoleId, query);

      expect(apprenantServiceMock.findAll).toHaveBeenCalledWith(query, ecoleId);
    });

    it('ne devrait pas modifier le query reçu', async () => {
      const query = {
        page: 1,
        limit: 10,
        search: 'DOE',
      };

      apprenantServiceMock.findAll.mockResolvedValue([]);

      await controller.findAll(ecoleId, query);

      expect(query).toEqual({
        page: 1,
        limit: 10,
        search: 'DOE',
      });
    });
  });

  describe('findOne', () => {
    it('devrait appeler le service avec id et ecoleId', async () => {
      apprenantServiceMock.findOne.mockResolvedValue(apprenantMock);

      const result = await controller.findOne(ecoleId, apprenantId);

      expect(apprenantServiceMock.findOne).toHaveBeenCalledTimes(1);
      expect(apprenantServiceMock.findOne).toHaveBeenCalledWith(
        apprenantId,
        ecoleId,
      );
      expect(result).toEqual(apprenantMock);
    });

    it('devrait retourner le résultat du service', async () => {
      const serviceResult = {
        ...apprenantMock,
        parents: [],
        inscriptions: [],
      };

      apprenantServiceMock.findOne.mockResolvedValue(serviceResult);

      const result = await controller.findOne(ecoleId, apprenantId);

      expect(result).toBe(serviceResult);
    });
  });

  describe('update', () => {
    it('devrait appeler le service avec id, dto et ecoleId', async () => {
      const dto = {
        nom: 'NOUVEAU NOM',
        prenom: 'Nouveau prénom',
      };

      const serviceResult = {
        ...apprenantMock,
        ...dto,
      };

      apprenantServiceMock.update.mockResolvedValue(serviceResult);

      const result = await controller.update(ecoleId, apprenantId, dto);

      expect(apprenantServiceMock.update).toHaveBeenCalledTimes(1);
      expect(apprenantServiceMock.update).toHaveBeenCalledWith(
        apprenantId,
        dto,
        ecoleId,
      );
      expect(result).toEqual(serviceResult);
    });

    it('devrait transmettre uniquement les données reçues dans le DTO', async () => {
      const dto = {
        nom: 'NOUVEAU NOM',
      };

      apprenantServiceMock.update.mockResolvedValue({
        ...apprenantMock,
        ...dto,
      });

      await controller.update(ecoleId, apprenantId, dto);

      expect(apprenantServiceMock.update).toHaveBeenCalledWith(
        apprenantId,
        dto,
        ecoleId,
      );
    });
  });

  describe('remove', () => {
    it('devrait appeler le service avec id et ecoleId', async () => {
      const serviceResult = {
        message: 'Apprenant supprimé avec succès.',
      };

      apprenantServiceMock.remove.mockResolvedValue(serviceResult);

      const result = await controller.remove(ecoleId, apprenantId);

      expect(apprenantServiceMock.remove).toHaveBeenCalledTimes(1);
      expect(apprenantServiceMock.remove).toHaveBeenCalledWith(
        apprenantId,
        ecoleId,
      );
      expect(result).toEqual(serviceResult);
    });

    it('devrait retourner exactement le résultat du service', async () => {
      const serviceResult = {
        message: 'Apprenant supprimé avec succès.',
      };

      apprenantServiceMock.remove.mockResolvedValue(serviceResult);

      const result = await controller.remove(ecoleId, apprenantId);

      expect(result).toBe(serviceResult);
    });
  });
});
