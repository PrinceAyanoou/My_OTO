import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { InscriptionService } from './inscription.service';
import type {
  ChangeClasseDto,
  UpdateInscriptionDto,
} from './dto/inscription.dto';

describe('InscriptionService', () => {
  let service: InscriptionService;

  const prismaMock = {
    classscolaire: {
      findFirst: jest.fn(),
    },
    note: {
      count: jest.fn(),
    },
    inscription: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const ecoleId = '11111111-1111-4111-8111-111111111111';
  const apprenantId = '22222222-2222-4222-8222-222222222222';
  const anneeScolaireId = '33333333-3333-4333-8333-333333333333';
  const classeId = '44444444-4444-4444-8444-444444444444';
  const nouvelleClasseId = '55555555-5555-4555-8555-555555555555';

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InscriptionService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<InscriptionService>(InscriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllBySchool', () => {
    it('retourne les inscriptions filtrées par école, année et classe', async () => {
      const response = [{ apprenantId }];
      prismaMock.inscription.findMany.mockResolvedValue(response);

      await expect(
        service.findAllBySchool(ecoleId, anneeScolaireId, classeId),
      ).resolves.toBe(response);
      expect(prismaMock.inscription.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            anneescolaire: { ecoleId },
            anneeScolaireId,
            classeScolaireId: classeId,
          },
          orderBy: { dateInscription: 'desc' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('retourne une inscription avec sa clé composée', async () => {
      const response = { apprenantId, anneeScolaireId };
      prismaMock.inscription.findFirst.mockResolvedValue(response);

      await expect(
        service.findOne(apprenantId, anneeScolaireId, ecoleId),
      ).resolves.toBe(response);
      expect(prismaMock.inscription.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            apprenantId,
            anneeScolaireId,
            anneescolaire: { ecoleId },
          },
        }),
      );
    });

    it('lève NotFoundException si l’inscription est introuvable', async () => {
      prismaMock.inscription.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne(apprenantId, anneeScolaireId, ecoleId),
      ).rejects.toThrow(
        new NotFoundException(
          "Inscription introuvable pour cet apprenant sur l'année scolaire spécifiée.",
        ),
      );
    });
  });

  describe('changeClasse', () => {
    const dto: ChangeClasseDto = {
      nouvelleClasseId,
      motif: 'Changement demandé',
    };

    it('change la classe quand la capacité et les notes le permettent', async () => {
      const current = {
        apprenantId,
        anneeScolaireId,
        classeScolaireId: classeId,
      };
      const response = { ...current, classeScolaireId: nouvelleClasseId };
      prismaMock.inscription.findFirst.mockResolvedValue(current);
      prismaMock.classscolaire.findFirst.mockResolvedValue({
        id: nouvelleClasseId,
        capacite: 30,
        _count: { inscription: 10 },
      });
      prismaMock.note.count.mockResolvedValue(0);
      prismaMock.inscription.update.mockResolvedValue(response);

      await expect(
        service.changeClasse(apprenantId, anneeScolaireId, dto, ecoleId),
      ).resolves.toBe(response);
      expect(prismaMock.inscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            apprenantId_anneeScolaireId: { apprenantId, anneeScolaireId },
          },
          data: { classeScolaireId: nouvelleClasseId },
        }),
      );
    });

    it('refuse un changement vers la même classe', async () => {
      prismaMock.inscription.findFirst.mockResolvedValue({
        apprenantId,
        anneeScolaireId,
        classeScolaireId: nouvelleClasseId,
      });

      await expect(
        service.changeClasse(apprenantId, anneeScolaireId, dto, ecoleId),
      ).rejects.toThrow(
        new BadRequestException(
          "L'apprenant est déjà inscrit dans cette classe.",
        ),
      );
      expect(prismaMock.classscolaire.findFirst).not.toHaveBeenCalled();
    });

    it('refuse une classe arrivée à capacité maximale', async () => {
      prismaMock.inscription.findFirst.mockResolvedValue({
        apprenantId,
        anneeScolaireId,
        classeScolaireId: classeId,
      });
      prismaMock.classscolaire.findFirst.mockResolvedValue({
        id: nouvelleClasseId,
        capacite: 10,
        _count: { inscription: 10 },
      });

      await expect(
        service.changeClasse(apprenantId, anneeScolaireId, dto, ecoleId),
      ).rejects.toThrow(
        new BadRequestException(
          "La classe de destination a atteint sa capacité maximale d'accueil.",
        ),
      );
      expect(prismaMock.note.count).not.toHaveBeenCalled();
    });

    it('refuse le changement si des notes existent', async () => {
      prismaMock.inscription.findFirst.mockResolvedValue({
        apprenantId,
        anneeScolaireId,
        classeScolaireId: classeId,
      });
      prismaMock.classscolaire.findFirst.mockResolvedValue({
        id: nouvelleClasseId,
        capacite: 30,
        _count: { inscription: 10 },
      });
      prismaMock.note.count.mockResolvedValue(2);

      await expect(
        service.changeClasse(apprenantId, anneeScolaireId, dto, ecoleId),
      ).rejects.toThrow(
        new BadRequestException(
          `Changement de classe refusé : 2 note(s) ont déjà été enregistrées pour cet apprenant sur l'année en cours.`,
        ),
      );
      expect(prismaMock.inscription.update).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('met à jour les champs et convertit la date', async () => {
      const dateInscription = '2026-09-01T00:00:00.000Z';
      const dto: UpdateInscriptionDto = {
        type: 'REINSCRIPTION',
        matricule: 'INS-2026-001',
        dateInscription,
      };
      const current = { apprenantId, anneeScolaireId };
      const response = { ...current, ...dto };
      prismaMock.inscription.findFirst.mockResolvedValue(current);
      prismaMock.inscription.update.mockResolvedValue(response);

      await expect(
        service.update(apprenantId, anneeScolaireId, dto, ecoleId),
      ).resolves.toBe(response);
      const updateCall = prismaMock.inscription.update.mock.calls[0] as [
        {
          where: {
            apprenantId_anneeScolaireId: {
              apprenantId: string;
              anneeScolaireId: string;
            };
          };
          data: {
            type: string;
            matricule: string;
            dateInscription: Date;
          };
        },
      ];
      const [payload] = updateCall;

      expect(payload.where).toEqual({
        apprenantId_anneeScolaireId: { apprenantId, anneeScolaireId },
      });
      expect(payload.data.type).toBe('REINSCRIPTION');
      expect(payload.data.matricule).toBe('INS-2026-001');
      expect(payload.data.dateInscription).toEqual(new Date(dateInscription));
    });
  });

  describe('remove', () => {
    it('supprime l’inscription après vérification de son existence', async () => {
      const response = { apprenantId, anneeScolaireId };
      prismaMock.inscription.findFirst.mockResolvedValue(response);
      prismaMock.inscription.delete.mockResolvedValue(response);

      await expect(
        service.remove(apprenantId, anneeScolaireId, ecoleId),
      ).resolves.toBe(response);
      expect(prismaMock.inscription.delete).toHaveBeenCalledWith({
        where: {
          apprenantId_anneeScolaireId: { apprenantId, anneeScolaireId },
        },
      });
    });
  });
});
