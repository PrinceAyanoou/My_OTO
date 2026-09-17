import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NoteService } from './note.service';
import { PrismaService } from '../prisma/prisma.service';
import { StudentTokenService } from './hash.service';
import type { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';

describe('NoteService', () => {
  let service: NoteService;

  const prismaMock = {
    evaluation: {
      findFirst: jest.fn(),
    },
    inscription: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    classscolaire: {
      findFirst: jest.fn(),
    },
    note: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const tokenMock = {
    encodeId: jest.fn(),
    decodeId: jest.fn(),
  };

  const ecoleId = '11111111-1111-4111-8111-111111111111';
  const evaluationId = '22222222-2222-4222-8222-222222222222';
  const apprenantId = '33333333-3333-4333-8333-333333333333';
  const anneeId = '44444444-4444-4444-8444-444444444444';
  const noteId = '55555555-5555-4555-8555-555555555555';

  const evaluation = {
    id: evaluationId,
    affectationId: 'affectation-1',
    typeEvaluationId: 'type-1',
    periodeScolaireId: 'periode-1',
    periodescolaire: {},
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoteService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: StudentTokenService, useValue: tokenMock },
      ],
    }).compile();

    service = module.get<NoteService>(NoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrUpdate', () => {
    const dto: CreateNoteDto = {
      Valeur: 15,
      noteSur: 20,
      evaluationId,
      inscriptionApprenantId: apprenantId,
      inscriptionAnneeId: anneeId,
      Observation: '  Bien  ',
    };

    beforeEach(() => {
      prismaMock.evaluation.findFirst.mockResolvedValue(evaluation);
      prismaMock.inscription.findFirst.mockResolvedValue({
        apprenantId,
        anneeScolaireId: anneeId,
      });
    });

    it('crée une note si aucune note existante', async () => {
      const response = { id: noteId, Valeur: 15 };
      prismaMock.note.findFirst.mockResolvedValue(null);
      prismaMock.note.create.mockResolvedValue(response);

      await expect(service.createOrUpdate(dto, ecoleId)).resolves.toBe(
        response,
      );
      expect(prismaMock.note.create).toHaveBeenCalledWith({
        data: {
          Valeur: 15,
          Observation: 'Bien',
          noteSur: 20,
          evaluationId,
          affectationEnseignantId: evaluation.affectationId,
          typeEvaluationId: evaluation.typeEvaluationId,
          periodeScolaireId: evaluation.periodeScolaireId,
          inscriptionApprenantId: apprenantId,
          inscriptionAnneeId: anneeId,
        },
      });
    });

    it('met à jour une note existante', async () => {
      const response = { id: noteId, Valeur: 18 };
      prismaMock.note.findFirst.mockResolvedValue({ id: noteId });
      prismaMock.note.update.mockResolvedValue(response);

      await expect(
        service.createOrUpdate({ ...dto, Valeur: 18 }, ecoleId),
      ).resolves.toBe(response);
      expect(prismaMock.note.update).toHaveBeenCalledWith({
        where: { id: noteId },
        data: { Valeur: 18, Observation: 'Bien', noteSur: 20 },
      });
    });

    it('refuse une note supérieure au barème', async () => {
      prismaMock.note.findFirst.mockResolvedValue(null);

      await expect(
        service.createOrUpdate({ ...dto, Valeur: 21 }, ecoleId),
      ).rejects.toThrow(
        new BadRequestException('La note doit être comprise entre 0 et 20.'),
      );
    });
  });

  describe('findByEvaluation', () => {
    it('valide l’évaluation puis retourne ses notes', async () => {
      const response = [{ id: noteId }];
      prismaMock.evaluation.findFirst.mockResolvedValue(evaluation);
      prismaMock.note.findMany.mockResolvedValue(response);

      await expect(
        service.findByEvaluation(evaluationId, ecoleId),
      ).resolves.toBe(response);
      expect(prismaMock.note.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { evaluationId },
          orderBy: { inscription: { apprenant: { nom: 'asc' } } },
        }),
      );
    });
  });

  describe('findByApprenant', () => {
    it('retourne les notes d’un apprenant pour une année', async () => {
      const response = [{ id: noteId }];
      prismaMock.note.findMany.mockResolvedValue(response);

      await expect(
        service.findByApprenant(apprenantId, anneeId, ecoleId),
      ).resolves.toBe(response);
      expect(prismaMock.note.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            inscriptionApprenantId: apprenantId,
            inscriptionAnneeId: anneeId,
            periodescolaire: { anneescolaire: { ecoleId } },
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('lève NotFoundException si la note est absente', async () => {
      prismaMock.note.findFirst.mockResolvedValue(null);

      await expect(service.findOne(noteId, ecoleId)).rejects.toThrow(
        new NotFoundException(`La note avec l'ID "${noteId}" n'existe pas.`),
      );
    });
  });

  describe('update', () => {
    it('met à jour une note dans son barème', async () => {
      const dto: UpdateNoteDto = { Valeur: 18, Observation: '  OK ' };
      const response = { id: noteId, Valeur: 18 };
      prismaMock.note.findFirst.mockResolvedValue({
        id: noteId,
        noteSur: 20,
        Valeur: 15,
      });
      prismaMock.note.update.mockResolvedValue(response);

      await expect(service.update(noteId, dto, ecoleId)).resolves.toBe(
        response,
      );
      expect(prismaMock.note.update).toHaveBeenCalledWith({
        where: { id: noteId },
        data: { Valeur: 18, Observation: 'OK', noteSur: undefined },
      });
    });
  });

  describe('generateClassSheet', () => {
    it('génère un buffer Excel pour une classe inscrite', async () => {
      prismaMock.evaluation.findFirst.mockResolvedValue(evaluation);
      prismaMock.classscolaire.findFirst.mockResolvedValue({ id: 'classe-1' });
      prismaMock.inscription.findMany.mockResolvedValue([
        {
          apprenantId,
          anneeScolaireId: anneeId,
          apprenant: {
            matricule: 'MAT-1',
            nom: 'Dupont',
            prenoms: 'Jean',
          },
          note: [],
        },
      ]);
      tokenMock.encodeId.mockReturnValue('token-1');

      const result = await service.generateClassSheet(
        '66666666-6666-4666-8666-666666666666',
        evaluationId,
        ecoleId,
      );

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(tokenMock.encodeId).toHaveBeenCalledWith(
        `${apprenantId}:${anneeId}`,
      );
    });
  });

  describe('remove', () => {
    it('supprime une note existante', async () => {
      const response = { id: noteId };
      prismaMock.note.findFirst.mockResolvedValue({ id: noteId });
      prismaMock.note.delete.mockResolvedValue(response);

      await expect(service.remove(noteId, ecoleId)).resolves.toBe(response);
      expect(prismaMock.note.delete).toHaveBeenCalledWith({
        where: { id: noteId },
      });
    });
  });
});
