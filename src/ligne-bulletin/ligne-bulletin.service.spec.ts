import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LigneBulletinService } from './ligne-bulletin.service';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateLigneBulletinDto,
  UpdateLigneBulletinDto,
} from './dto/ligne-bulletin.dto';

describe('LigneBulletinService', () => {
  let service: LigneBulletinService;

  const prismaMock = {
    bulletin: {
      findFirst: jest.fn(),
    },
    matiere: {
      findFirst: jest.fn(),
    },
    classematirere: {
      findUnique: jest.fn(),
    },
    lignebulletin: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const ecoleId = '11111111-1111-4111-8111-111111111111';
  const bulletinApprenantId = '22222222-2222-4222-8222-222222222222';
  const bulletinAnneeId = '33333333-3333-4333-8333-333333333333';
  const bulletinId = '44444444-4444-4444-8444-444444444444';
  const matiereId = '55555555-5555-4555-8555-555555555555';
  const ligneId = '66666666-6666-4666-8666-666666666666';
  const classeScolaireId = '77777777-7777-4777-8777-777777777777';
  const createDto: CreateLigneBulletinDto = {
    bulletinApprenantId,
    bulletinAnneeId,
    bulletinId,
    matiereId,
    moyenne: 15,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LigneBulletinService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<LigneBulletinService>(LigneBulletinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('crée une ligne avec le coefficient de la classe', async () => {
      const response = { id: ligneId, ...createDto, coefficient: 2 };
      prismaMock.bulletin.findFirst.mockResolvedValue({
        inscription: { classeScolaireId },
      });
      prismaMock.matiere.findFirst.mockResolvedValue({ id: matiereId });
      prismaMock.classematirere.findUnique.mockResolvedValue({
        coefficient: 2,
      });
      prismaMock.lignebulletin.findFirst.mockResolvedValue(null);
      prismaMock.lignebulletin.create.mockResolvedValue(response);

      await expect(service.create(createDto, ecoleId)).resolves.toBe(response);
      expect(prismaMock.lignebulletin.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            bulletinApprenantId,
            bulletinAnneeId,
            bulletinId,
            matiereId,
            moyenne: 15,
            coefficient: 2,
          },
        }),
      );
    });

    it('lève NotFoundException si le bulletin est introuvable', async () => {
      prismaMock.bulletin.findFirst.mockResolvedValue(null);

      await expect(service.create(createDto, ecoleId)).rejects.toThrow(
        new NotFoundException('Le bulletin indiqué est introuvable'),
      );
      expect(prismaMock.matiere.findFirst).not.toHaveBeenCalled();
    });

    it('refuse une matière non associée à la classe', async () => {
      prismaMock.bulletin.findFirst.mockResolvedValue({
        inscription: { classeScolaireId },
      });
      prismaMock.matiere.findFirst.mockResolvedValue({ id: matiereId });
      prismaMock.classematirere.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto, ecoleId)).rejects.toThrow(
        new ConflictException(
          'Cette matière n’est pas associée à la classe de l’apprenant',
        ),
      );
    });

    it('refuse une matière déjà présente dans le bulletin', async () => {
      prismaMock.bulletin.findFirst.mockResolvedValue({
        inscription: { classeScolaireId },
      });
      prismaMock.matiere.findFirst.mockResolvedValue({ id: matiereId });
      prismaMock.classematirere.findUnique.mockResolvedValue({
        coefficient: 2,
      });
      prismaMock.lignebulletin.findFirst.mockResolvedValue({ id: ligneId });

      await expect(service.create(createDto, ecoleId)).rejects.toThrow(
        new ConflictException('Cette matière existe déjà dans ce bulletin'),
      );
      expect(prismaMock.lignebulletin.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('retourne les lignes de bulletin de l’école', async () => {
      const response = [{ id: ligneId }];
      prismaMock.lignebulletin.findMany.mockResolvedValue(response);

      await expect(service.findAll(ecoleId)).resolves.toBe(response);
      expect(prismaMock.lignebulletin.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { bulletin: { inscription: { anneescolaire: { ecoleId } } } },
          orderBy: { matiere: { nom: 'asc' } },
        }),
      );
    });
  });

  describe('findByBulletin', () => {
    it('vérifie le bulletin puis retourne ses lignes', async () => {
      const response = [{ id: ligneId }];
      prismaMock.bulletin.findFirst.mockResolvedValue({ id: bulletinId });
      prismaMock.lignebulletin.findMany.mockResolvedValue(response);

      await expect(
        service.findByBulletin(
          bulletinApprenantId,
          bulletinAnneeId,
          bulletinId,
          ecoleId,
        ),
      ).resolves.toBe(response);
      expect(prismaMock.lignebulletin.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            bulletinApprenantId,
            bulletinAnneeId,
            bulletinId,
            bulletin: { inscription: { anneescolaire: { ecoleId } } },
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('lève NotFoundException si la ligne est introuvable', async () => {
      prismaMock.lignebulletin.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne(
          bulletinApprenantId,
          bulletinAnneeId,
          bulletinId,
          matiereId,
          ecoleId,
        ),
      ).rejects.toThrow(
        new NotFoundException('La ligne de bulletin est introuvable'),
      );
    });
  });

  describe('update', () => {
    it('met à jour la moyenne de la ligne trouvée', async () => {
      const dto: UpdateLigneBulletinDto = { moyenne: 18 };
      const response = { id: ligneId, moyenne: 18 };
      prismaMock.lignebulletin.findFirst.mockResolvedValue({ id: ligneId });
      prismaMock.lignebulletin.update.mockResolvedValue(response);

      await expect(
        service.update(
          bulletinApprenantId,
          bulletinAnneeId,
          bulletinId,
          matiereId,
          dto,
          ecoleId,
        ),
      ).resolves.toBe(response);
      expect(prismaMock.lignebulletin.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: ligneId },
          data: { moyenne: 18 },
        }),
      );
    });
  });

  describe('remove', () => {
    it('supprime la ligne trouvée et retourne un message', async () => {
      prismaMock.lignebulletin.findFirst.mockResolvedValue({ id: ligneId });
      prismaMock.lignebulletin.delete.mockResolvedValue({ id: ligneId });

      await expect(
        service.remove(
          bulletinApprenantId,
          bulletinAnneeId,
          bulletinId,
          matiereId,
          ecoleId,
        ),
      ).resolves.toEqual({
        message: 'La ligne de bulletin a été supprimée avec succès',
      });
      expect(prismaMock.lignebulletin.delete).toHaveBeenCalledWith({
        where: { id: ligneId },
      });
    });
  });
});
