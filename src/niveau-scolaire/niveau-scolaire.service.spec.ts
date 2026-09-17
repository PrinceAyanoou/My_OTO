import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { NiveauScolaireService } from './niveau-scolaire.service';
import type {
  CreateNiveauScolaireDto,
  QueryNiveauScolaireDto,
  UpdateNiveauScolaireDto,
} from './dto/niveau-scolaire.dto';

describe('NiveauScolaireService', () => {
  let service: NiveauScolaireService;

  const prismaMock = {
    niveauscolaire: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const ecoleId = '11111111-1111-4111-8111-111111111111';
  const niveauId = '22222222-2222-4222-8222-222222222222';
  const createDto: CreateNiveauScolaireDto = { nom: 'Sixième' };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NiveauScolaireService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<NiveauScolaireService>(NiveauScolaireService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('crée un niveau rattaché à l’école', async () => {
      const response = { id: niveauId, ...createDto, ecoleId };
      prismaMock.niveauscolaire.findUnique.mockResolvedValue(null);
      prismaMock.niveauscolaire.create.mockResolvedValue(response);

      await expect(service.create(ecoleId, createDto)).resolves.toBe(response);
      expect(prismaMock.niveauscolaire.findUnique).toHaveBeenCalledWith({
        where: {
          nom_ecoleId: { nom: createDto.nom, ecoleId },
        },
      });
      expect(prismaMock.niveauscolaire.create).toHaveBeenCalledWith({
        data: { nom: createDto.nom, ecoleId },
      });
    });

    it('refuse un niveau déjà existant dans l’école', async () => {
      prismaMock.niveauscolaire.findUnique.mockResolvedValue({ id: niveauId });

      await expect(service.create(ecoleId, createDto)).rejects.toThrow(
        new ConflictException(
          `Le niveau scolaire "${createDto.nom}" existe déjà pour cette école.`,
        ),
      );
      expect(prismaMock.niveauscolaire.create).not.toHaveBeenCalled();
    });
  });

  describe('findAllByEcole', () => {
    it('retourne les niveaux filtrés par recherche', async () => {
      const query: QueryNiveauScolaireDto = { search: 'six' };
      const response = [{ id: niveauId, nom: 'Sixième' }];
      prismaMock.niveauscolaire.findMany.mockResolvedValue(response);

      await expect(service.findAllByEcole(ecoleId, query)).resolves.toBe(
        response,
      );
      expect(prismaMock.niveauscolaire.findMany).toHaveBeenCalledWith({
        where: { ecoleId, nom: { contains: 'six' } },
        include: {
          classscolaire: {
            select: { id: true, nom: true, capacite: true },
          },
          _count: {
            select: { classscolaire: true },
          },
        },
        orderBy: { nom: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('retourne un niveau appartenant à l’école', async () => {
      const response = { id: niveauId, ecoleId, nom: createDto.nom };
      prismaMock.niveauscolaire.findFirst.mockResolvedValue(response);

      await expect(service.findOne(ecoleId, niveauId)).resolves.toBe(response);
      expect(prismaMock.niveauscolaire.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: niveauId, ecoleId },
        }),
      );
    });

    it('lève NotFoundException si le niveau est introuvable', async () => {
      prismaMock.niveauscolaire.findFirst.mockResolvedValue(null);

      await expect(service.findOne(ecoleId, niveauId)).rejects.toThrow(
        new NotFoundException('Niveau scolaire introuvable pour cette école.'),
      );
    });
  });

  describe('update', () => {
    it('met à jour un niveau existant', async () => {
      const dto: UpdateNiveauScolaireDto = { nom: 'Cinquième' };
      const response = { id: niveauId, ...dto };
      prismaMock.niveauscolaire.findFirst.mockResolvedValue({
        id: niveauId,
        ecoleId,
      });
      prismaMock.niveauscolaire.update.mockResolvedValue(response);

      await expect(service.update(ecoleId, niveauId, dto)).resolves.toBe(
        response,
      );
      expect(prismaMock.niveauscolaire.update).toHaveBeenCalledWith({
        where: { id: niveauId },
        data: dto,
      });
    });
  });

  describe('remove', () => {
    it('supprime un niveau appartenant à l’école', async () => {
      const response = { id: niveauId };
      prismaMock.niveauscolaire.findFirst.mockResolvedValue({ id: niveauId });
      prismaMock.niveauscolaire.delete.mockResolvedValue(response);

      await expect(service.remove(ecoleId, niveauId)).resolves.toBe(response);
      expect(prismaMock.niveauscolaire.delete).toHaveBeenCalledWith({
        where: { id: niveauId },
      });
    });
  });
});
