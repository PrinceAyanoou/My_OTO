import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { EvaluationService } from './evaluation.service';
import type { CreateEvaluationDto, UpdateEvaluationDto } from './dto/evaluation.dto';

describe('EvaluationService', () => {
  let service: EvaluationService;

  const prismaMock = {
    affectationenseignant: {
      findFirst: jest.fn(),
    },
    typeevaluation: {
      findFirst: jest.fn(),
    },
    periodescolaire: {
      findFirst: jest.fn(),
    },
    evaluation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const ecoleId = '11111111-1111-4111-8111-111111111111';
  const evaluationId = '66666666-6666-4666-8666-666666666666';
  const affectationId = '22222222-2222-4222-8222-222222222222';
  const typeEvaluationId = '33333333-3333-4333-8333-333333333333';
  const periodeScolaireId = '44444444-4444-4444-8444-444444444444';
  const createDto: CreateEvaluationDto = {
    titre: 'Devoir de mathématiques',
    date: '2026-09-07',
    affectationId,
    typeEvaluationId,
    periodeScolaireId,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<EvaluationService>(EvaluationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('valide les relations et crée l’évaluation avec une date Date', async () => {
      const response = { id: evaluationId, ...createDto };
      prismaMock.affectationenseignant.findFirst.mockResolvedValue({
        id: affectationId,
      });
      prismaMock.typeevaluation.findFirst.mockResolvedValue({
        id: typeEvaluationId,
      });
      prismaMock.periodescolaire.findFirst.mockResolvedValue({
        id: periodeScolaireId,
      });
      prismaMock.evaluation.create.mockResolvedValue(response);

      await expect(service.create(createDto, ecoleId)).resolves.toBe(response);

      expect(prismaMock.evaluation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ...createDto,
            date: new Date(createDto.date),
          },
        }),
      );
      expect(prismaMock.affectationenseignant.findFirst).toHaveBeenCalledWith({
        where: { id: affectationId, anneescolaire: { ecoleId } },
      });
      expect(prismaMock.typeevaluation.findFirst).toHaveBeenCalledWith({
        where: { id: typeEvaluationId, ecoleId },
      });
      expect(prismaMock.periodescolaire.findFirst).toHaveBeenCalledWith({
        where: { id: periodeScolaireId, anneescolaire: { ecoleId } },
      });
    });

    it('lève NotFoundException si l’affectation est absente', async () => {
      prismaMock.affectationenseignant.findFirst.mockResolvedValue(null);

      await expect(service.create(createDto, ecoleId)).rejects.toThrow(
        new NotFoundException(
          "L'affectation enseignant est introuvable ou n'appartient pas à cette école.",
        ),
      );
      expect(prismaMock.typeevaluation.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('findAllBySchool', () => {
    it('retourne les évaluations avec les filtres fournis', async () => {
      const filters = {
        classeScolaireId: '55555555-5555-4555-8555-555555555555',
        periodeScolaireId,
        matiereId: '77777777-7777-4777-8777-777777777777',
      };
      const response = [{ id: evaluationId }];
      prismaMock.evaluation.findMany.mockResolvedValue(response);

      await expect(
        service.findAllBySchool(ecoleId, filters),
      ).resolves.toBe(response);
      expect(prismaMock.evaluation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            periodescolaire: { anneescolaire: { ecoleId } },
            periodeScolaireId,
            affectationenseignant: { matiereId: filters.matiereId },
          },
          orderBy: { date: 'desc' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('retourne une évaluation appartenant à l’école', async () => {
      const response = { id: evaluationId, note: [] };
      prismaMock.evaluation.findFirst.mockResolvedValue(response);

      await expect(service.findOne(evaluationId, ecoleId)).resolves.toBe(
        response,
      );
      expect(prismaMock.evaluation.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: evaluationId,
            periodescolaire: { anneescolaire: { ecoleId } },
          },
        }),
      );
    });

    it('lève NotFoundException si elle est introuvable', async () => {
      prismaMock.evaluation.findFirst.mockResolvedValue(null);

      await expect(service.findOne(evaluationId, ecoleId)).rejects.toThrow(
        new NotFoundException('Évaluation introuvable dans cette école.'),
      );
    });
  });

  describe('update', () => {
    it('valide les relations et met à jour l’évaluation', async () => {
      const current = {
        id: evaluationId,
        affectationId,
        typeEvaluationId,
        periodeScolaireId,
        note: [],
      };
      const dto: UpdateEvaluationDto = { titre: 'Devoir corrigé' };
      const response = { ...current, ...dto };
      prismaMock.evaluation.findFirst.mockResolvedValue(current);
      prismaMock.affectationenseignant.findFirst.mockResolvedValue({
        id: affectationId,
      });
      prismaMock.typeevaluation.findFirst.mockResolvedValue({
        id: typeEvaluationId,
      });
      prismaMock.periodescolaire.findFirst.mockResolvedValue({
        id: periodeScolaireId,
      });
      prismaMock.evaluation.update.mockResolvedValue(response);

      await expect(service.update(evaluationId, dto, ecoleId)).resolves.toBe(
        response,
      );
      expect(prismaMock.evaluation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: evaluationId },
          data: dto,
        }),
      );
    });
  });

  describe('remove', () => {
    it('refuse la suppression si des notes existent', async () => {
      prismaMock.evaluation.findFirst.mockResolvedValue({
        id: evaluationId,
        note: [{ id: 'note-1' }, { id: 'note-2' }],
      });

      await expect(service.remove(evaluationId, ecoleId)).rejects.toThrow(
        new BadRequestException(
          "Impossible de supprimer une évaluation contenant déjà 2 note(s) saisie(s). Supprimez d'abord les notes.",
        ),
      );
      expect(prismaMock.evaluation.delete).not.toHaveBeenCalled();
    });

    it('supprime une évaluation sans note', async () => {
      prismaMock.evaluation.findFirst.mockResolvedValue({
        id: evaluationId,
        note: [],
      });
      prismaMock.evaluation.delete.mockResolvedValue({ id: evaluationId });

      await expect(service.remove(evaluationId, ecoleId)).resolves.toEqual({
        id: evaluationId,
      });
      expect(prismaMock.evaluation.delete).toHaveBeenCalledWith({
        where: { id: evaluationId },
      });
    });
  });
});
