import { Test, TestingModule } from '@nestjs/testing';
import { AnnonceController } from './annonce.controller';
import { AnnonceService } from './annonce.service';
import { CreateAnnonceDto, UpdateAnnonceDto } from './dto/annonce.dto';
import { ClerkAuthGuard } from 'src/auth/guards/clerk-auth.guard';
import { PoliciesGuard } from 'src/auth/guards/permissions.guard';

describe('AnnonceController', () => {
  let controller: AnnonceController;

  const annonceServiceMock = {
    create: jest.fn(),
    findAllBySchool: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const ecoleId = '550e8400-e29b-41d4-a716-446655440000';
  const annonceId = '550e8400-e29b-41d4-a716-446655440001';
  const auteurId = '550e8400-e29b-41d4-a716-446655440002';

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
      controllers: [AnnonceController],
      providers: [
        {
          provide: AnnonceService,
          useValue: annonceServiceMock,
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

    controller = module.get<AnnonceController>(AnnonceController);
  });

  describe('should be defined', () => {
    it('devrait être défini', () => {
      expect(controller).toBeDefined();
    });
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
    } as CreateAnnonceDto;

    it('devrait appeler le service avec le DTO et ecoleId', async () => {
      annonceServiceMock.create.mockResolvedValue(annonceMock);

      const result = await controller.create(ecoleId, dto);

      expect(annonceServiceMock.create).toHaveBeenCalledTimes(1);
      expect(annonceServiceMock.create).toHaveBeenCalledWith(dto, ecoleId);

      expect(result).toEqual(annonceMock);
    });

    it('devrait retourner le résultat du service', async () => {
      const expected = {
        ...annonceMock,
        titre: 'Nouvelle annonce',
      };

      annonceServiceMock.create.mockResolvedValue(expected);

      const result = await controller.create(ecoleId, dto);

      expect(result).toEqual(expected);
    });
  });

  describe('findAllBySchool', () => {
    it('devrait récupérer toutes les annonces sans filtre actif', async () => {
      annonceServiceMock.findAllBySchool.mockResolvedValue([annonceMock]);

      const result = await controller.findAllBySchool(ecoleId);

      expect(annonceServiceMock.findAllBySchool).toHaveBeenCalledTimes(1);
      expect(annonceServiceMock.findAllBySchool).toHaveBeenCalledWith(
        ecoleId,
        false,
      );

      expect(result).toEqual([annonceMock]);
    });

    it('devrait transmettre onlyActive=true au service', async () => {
      annonceServiceMock.findAllBySchool.mockResolvedValue([annonceMock]);

      const result = await controller.findAllBySchool(ecoleId, true);

      expect(annonceServiceMock.findAllBySchool).toHaveBeenCalledWith(
        ecoleId,
        true,
      );

      expect(result).toEqual([annonceMock]);
    });

    it('devrait transmettre onlyActive=false au service', async () => {
      annonceServiceMock.findAllBySchool.mockResolvedValue([annonceMock]);

      await controller.findAllBySchool(ecoleId, false);

      expect(annonceServiceMock.findAllBySchool).toHaveBeenCalledWith(
        ecoleId,
        false,
      );
    });
  });

  describe('findOne', () => {
    it("devrait récupérer une annonce par son ID et l'école", async () => {
      annonceServiceMock.findOne.mockResolvedValue(annonceMock);

      const result = await controller.findOne(ecoleId, annonceId);

      expect(annonceServiceMock.findOne).toHaveBeenCalledTimes(1);
      expect(annonceServiceMock.findOne).toHaveBeenCalledWith(
        annonceId,
        ecoleId,
      );

      expect(result).toEqual(annonceMock);
    });

    it('devrait retourner exactement le résultat du service', async () => {
      const expected = {
        ...annonceMock,
        titre: 'Annonce test',
      };

      annonceServiceMock.findOne.mockResolvedValue(expected);

      const result = await controller.findOne(ecoleId, annonceId);

      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    const dto = {
      titre: 'Nouveau titre',
      contenu: 'Nouveau contenu',
    } as UpdateAnnonceDto;

    it('devrait appeler le service avec id, DTO et ecoleId', async () => {
      const expected = {
        ...annonceMock,
        ...dto,
      };

      annonceServiceMock.update.mockResolvedValue(expected);

      const result = await controller.update(ecoleId, annonceId, dto);

      expect(annonceServiceMock.update).toHaveBeenCalledTimes(1);
      expect(annonceServiceMock.update).toHaveBeenCalledWith(
        annonceId,
        dto,
        ecoleId,
      );

      expect(result).toEqual(expected);
    });

    it('devrait transmettre une mise à jour contenant des cibles', async () => {
      const dtoWithCibles = {
        titre: 'Nouvelle annonce',
        cibles: [
          {
            public: 'TOUS' as const,
            classeScolaireId: undefined,
          },
          {
            public: 'PARENT' as const,
            classeScolaireId: 'classe-123',
          },
        ],
      } as UpdateAnnonceDto;

      annonceServiceMock.update.mockResolvedValue(annonceMock);

      await controller.update(ecoleId, annonceId, dtoWithCibles);

      expect(annonceServiceMock.update).toHaveBeenCalledWith(
        annonceId,
        dtoWithCibles,
        ecoleId,
      );
    });
  });

  describe('remove', () => {
    it('devrait supprimer une annonce', async () => {
      const expected = {
        message: 'Annonce supprimée avec succès.',
      };

      annonceServiceMock.remove.mockResolvedValue(expected);

      const result = await controller.remove(ecoleId, annonceId);

      expect(annonceServiceMock.remove).toHaveBeenCalledTimes(1);
      expect(annonceServiceMock.remove).toHaveBeenCalledWith(
        annonceId,
        ecoleId,
      );

      expect(result).toEqual(expected);
    });

    it('devrait retourner le résultat du service', async () => {
      const expected = {
        message: 'Annonce supprimée avec succès.',
      };

      annonceServiceMock.remove.mockResolvedValue(expected);

      const result = await controller.remove(ecoleId, annonceId);

      expect(result).toBe(expected);
    });
  });
});
