import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { MatiereService } from './matiere.service';
import type {
  CreateMatiereDto,
  QueryMatiereDto,
  UpdateMatiereDto,
} from './dto/matiere.dto';

describe('MatiereService', () => {
  let service: MatiereService;

  const prismaMock = {
    ecole: {
      findUnique: jest.fn(),
    },
    matiere: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const ecoleId = '11111111-1111-4111-8111-111111111111';
  const matiereId = '22222222-2222-4222-8222-222222222222';
  const createDto: CreateMatiereDto = {
    nom: 'Mathématiques',
    CodeMat: 'MATH',
    description: 'Cours de mathématiques',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatiereService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<MatiereService>(MatiereService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('crée une matière rattachée à l’école', async () => {
      const response = { id: matiereId, ...createDto, ecoleId };
      prismaMock.ecole.findUnique.mockResolvedValue({ id: ecoleId });
      prismaMock.matiere.findUnique.mockResolvedValue(null);
      prismaMock.matiere.create.mockResolvedValue(response);

      await expect(service.create(ecoleId, createDto)).resolves.toBe(response);
      expect(prismaMock.matiere.findUnique).toHaveBeenCalledWith({
        where: { nom_ecoleId: { nom: createDto.nom, ecoleId } },
      });
      expect(prismaMock.matiere.create).toHaveBeenCalledWith({
        data: { ...createDto, ecoleId },
      });
    });

    it('lève NotFoundException si l’école est introuvable', async () => {
      prismaMock.ecole.findUnique.mockResolvedValue(null);

      await expect(service.create(ecoleId, createDto)).rejects.toThrow(
        new NotFoundException('École introuvable.'),
      );
      expect(prismaMock.matiere.create).not.toHaveBeenCalled();
    });

    it('refuse un nom déjà utilisé dans l’école', async () => {
      prismaMock.ecole.findUnique.mockResolvedValue({ id: ecoleId });
      prismaMock.matiere.findUnique.mockResolvedValue({ id: matiereId });

      await expect(service.create(ecoleId, createDto)).rejects.toThrow(
        new ConflictException(
          `Une matière nommée "${createDto.nom}" existe déjà dans cette école.`,
        ),
      );
      expect(prismaMock.matiere.create).not.toHaveBeenCalled();
    });
  });

  describe('findAllByEcole', () => {
    it('retourne les matières filtrées par nom ou code', async () => {
      const query: QueryMatiereDto = { search: 'math' };
      const response = [{ id: matiereId, ...createDto }];
      prismaMock.ecole.findUnique.mockResolvedValue({ id: ecoleId });
      prismaMock.matiere.findMany.mockResolvedValue(response);

      await expect(service.findAllByEcole(ecoleId, query)).resolves.toBe(
        response,
      );
      expect(prismaMock.matiere.findMany).toHaveBeenCalledWith({
        where: {
          ecoleId,
          OR: [
            { nom: { contains: 'math' } },
            { CodeMat: { contains: 'math' } },
          ],
        },
        orderBy: { nom: 'asc' },
      });
    });

    it('lève NotFoundException si aucune matière n’existe', async () => {
      prismaMock.ecole.findUnique.mockResolvedValue({ id: ecoleId });
      prismaMock.matiere.findMany.mockResolvedValue([]);

      await expect(service.findAllByEcole(ecoleId)).rejects.toThrow(
        new NotFoundException('Cette école ne dispose pas de matière'),
      );
    });
  });

  describe('findOne', () => {
    it('retourne une matière appartenant à l’école', async () => {
      const response = { id: matiereId, ecoleId, nom: createDto.nom };
      prismaMock.matiere.findFirst.mockResolvedValue(response);

      await expect(service.findOne(ecoleId, matiereId)).resolves.toBe(response);
      expect(prismaMock.matiere.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: matiereId, ecoleId },
        }),
      );
    });

    it('lève NotFoundException si la matière n’appartient pas à l’école', async () => {
      prismaMock.matiere.findFirst.mockResolvedValue(null);

      await expect(service.findOne(ecoleId, matiereId)).rejects.toThrow(
        new NotFoundException('Matière introuvable pour cette école.'),
      );
    });
  });

  describe('update', () => {
    it('met à jour une matière existante', async () => {
      const dto: UpdateMatiereDto = { nom: 'Algèbre' };
      const response = { id: matiereId, ...dto };
      prismaMock.matiere.findFirst
        .mockResolvedValueOnce({ id: matiereId, ecoleId })
        .mockResolvedValueOnce(null);
      prismaMock.matiere.update.mockResolvedValue(response);

      await expect(service.update(ecoleId, matiereId, dto)).resolves.toBe(
        response,
      );
      expect(prismaMock.matiere.update).toHaveBeenCalledWith({
        where: { id: matiereId },
        data: dto,
      });
    });

    it('refuse un nouveau nom déjà utilisé', async () => {
      const dto: UpdateMatiereDto = { nom: 'Physique' };
      prismaMock.matiere.findFirst
        .mockResolvedValueOnce({ id: matiereId, ecoleId })
        .mockResolvedValueOnce({ id: 'other-matiere' });

      await expect(service.update(ecoleId, matiereId, dto)).rejects.toThrow(
        new ConflictException(
          `Une matière nommée "${dto.nom}" existe déjà dans cette école.`,
        ),
      );
      expect(prismaMock.matiere.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('supprime une matière appartenant à l’école', async () => {
      prismaMock.matiere.findFirst.mockResolvedValue({ id: matiereId });
      prismaMock.matiere.delete.mockResolvedValue({ id: matiereId });

      await expect(service.remove(ecoleId, matiereId)).resolves.toEqual({
        id: matiereId,
      });
      expect(prismaMock.matiere.delete).toHaveBeenCalledWith({
        where: { id: matiereId },
      });
    });
  });
});
