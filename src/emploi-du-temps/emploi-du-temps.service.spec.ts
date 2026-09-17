import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmploiDuTempsService } from './emploi-du-temps.service';

describe('EmploiDuTempsService', () => {
  let service: EmploiDuTempsService;

  const prismaMock = {
    affectationenseignant: {
      findFirst: jest.fn(),
    },
    classscolaire: {
      findFirst: jest.fn(),
    },
    emploidutemps: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const ecoleId = 'ecole-123';
  const affectationId = 'affectation-123';
  const classeId = 'classe-123';
  const emploiId = 'emploi-123';
  const createDto = {
    affectationEnseignantId: affectationId,
    jourDeLaSemaine: 'LUNDI' as const,
    heureDebut: '08:00',
    heureFin: '10:00',
    classeScolaireId: classeId,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmploiDuTempsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<EmploiDuTempsService>(EmploiDuTempsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('crée un créneau après validation de l’affectation et de la classe', async () => {
      const response = { id: emploiId, ...createDto };
      prismaMock.affectationenseignant.findFirst.mockResolvedValue({
        id: affectationId,
        classeScolaireId: classeId,
      });
      prismaMock.classscolaire.findFirst.mockResolvedValue({ id: classeId });
      prismaMock.emploidutemps.create.mockResolvedValue(response);

      await expect(service.create(ecoleId, createDto)).resolves.toBe(response);

      expect(prismaMock.affectationenseignant.findFirst).toHaveBeenCalledWith({
        where: {
          id: affectationId,
          employe: { ecoleId },
        },
      });
      expect(prismaMock.classscolaire.findFirst).toHaveBeenCalledWith({
        where: {
          id: classeId,
          niveauscolaire: { ecoleId },
        },
      });
      expect(prismaMock.emploidutemps.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: createDto,
        }),
      );
    });

    it('refuse une classe différente de celle de l’affectation', async () => {
      prismaMock.affectationenseignant.findFirst.mockResolvedValue({
        id: affectationId,
        classeScolaireId: 'autre-classe',
      });
      prismaMock.classscolaire.findFirst.mockResolvedValue({ id: classeId });

      await expect(service.create(ecoleId, createDto)).rejects.toThrow(
        new ConflictException(
          "La classe du créneau doit correspondre à celle de l'affectation.",
        ),
      );
      expect(prismaMock.emploidutemps.create).not.toHaveBeenCalled();
    });

    it('lève une erreur si l’affectation est absente de l’école', async () => {
      prismaMock.affectationenseignant.findFirst.mockResolvedValue(null);

      await expect(service.create(ecoleId, createDto)).rejects.toThrow(
        new NotFoundException(
          "L'affectation enseignant est introuvable pour cette école.",
        ),
      );
      expect(prismaMock.classscolaire.findFirst).not.toHaveBeenCalled();
    });

    it('transforme une contrainte unique Prisma en ConflictException', async () => {
      prismaMock.affectationenseignant.findFirst.mockResolvedValue({
        id: affectationId,
        classeScolaireId: classeId,
      });
      prismaMock.classscolaire.findFirst.mockResolvedValue({ id: classeId });
      prismaMock.emploidutemps.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(service.create(ecoleId, createDto)).rejects.toThrow(
        new ConflictException(
          'Un créneau existe déjà pour cette affectation, ce jour et cette heure de début.',
        ),
      );
    });
  });

  describe('findAll', () => {
    it('filtre les créneaux par école et par critères facultatifs', async () => {
      const query = {
        classeScolaireId: classeId,
        affectationEnseignantId: affectationId,
        jourDeLaSemaine: 'LUNDI' as const,
      };
      const response = [{ id: emploiId }];
      prismaMock.emploidutemps.findMany.mockResolvedValue(response);

      await expect(service.findAll(ecoleId, query)).resolves.toBe(response);
      expect(prismaMock.emploidutemps.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            affectationenseignant: { employe: { ecoleId } },
            classeScolaireId: classeId,
            affectationEnseignantId: affectationId,
            jourDeLaSemaine: 'LUNDI',
          },
          orderBy: [{ jourDeLaSemaine: 'asc' }, { heureDebut: 'asc' }],
        }),
      );
    });
  });

  describe('findOne', () => {
    it('retourne le créneau trouvé dans l’école', async () => {
      const response = { id: emploiId };
      prismaMock.emploidutemps.findFirst.mockResolvedValue(response);

      await expect(service.findOne(ecoleId, emploiId)).resolves.toBe(response);
      expect(prismaMock.emploidutemps.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: emploiId,
            affectationenseignant: { employe: { ecoleId } },
          },
        }),
      );
    });

    it('lève NotFoundException si le créneau est introuvable', async () => {
      prismaMock.emploidutemps.findFirst.mockResolvedValue(null);

      await expect(service.findOne(ecoleId, emploiId)).rejects.toThrow(
        new NotFoundException(
          `L'emploi du temps avec l'ID ${emploiId} est introuvable.`,
        ),
      );
    });
  });

  describe('update', () => {
    it('valide les nouvelles relations avant de mettre à jour', async () => {
      const current = {
        id: emploiId,
        affectationEnseignantId: affectationId,
        classeScolaireId: classeId,
      };
      const dto = { heureFin: '11:00' };
      const response = { ...current, ...dto };
      prismaMock.emploidutemps.findFirst.mockResolvedValue(current);
      prismaMock.affectationenseignant.findFirst.mockResolvedValue({
        id: affectationId,
        classeScolaireId: classeId,
      });
      prismaMock.classscolaire.findFirst.mockResolvedValue({ id: classeId });
      prismaMock.emploidutemps.update.mockResolvedValue(response);

      await expect(service.update(ecoleId, emploiId, dto)).resolves.toBe(
        response,
      );
      expect(prismaMock.emploidutemps.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: emploiId },
          data: dto,
        }),
      );
    });
  });

  describe('remove', () => {
    it('supprime un créneau trouvé dans l’école', async () => {
      prismaMock.emploidutemps.findFirst.mockResolvedValue({ id: emploiId });
      prismaMock.emploidutemps.delete.mockResolvedValue({ id: emploiId });

      await expect(service.remove(ecoleId, emploiId)).resolves.toEqual({
        message: 'Créneau supprimé avec succès.',
      });
      expect(prismaMock.emploidutemps.delete).toHaveBeenCalledWith({
        where: { id: emploiId },
      });
    });
  });
});
