import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { BulletinService } from './bulletin.service';

describe('BulletinService', () => {
  let service: BulletinService;

  const apprenantId = '550e8400-e29b-41d4-a716-446655440000';
  const anneeId = '660e8400-e29b-41d4-a716-446655440000';
  const periodeId = '770e8400-e29b-41d4-a716-446655440000';
  const classeId = '880e8400-e29b-41d4-a716-446655440000';

  const prismaMock = {
    inscription: { findUnique: jest.fn(), findMany: jest.fn() },
    periodescolaire: { findUnique: jest.fn() },
    bulletin: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    classematirere: { findMany: jest.fn() },
    note: { findMany: jest.fn() },
    classscolaire: { findMany: jest.fn() },
  };

  const cloudinaryMock = { uploadStream: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BulletinService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: CloudinaryService, useValue: cloudinaryMock },
      ],
    }).compile();
    service = module.get<BulletinService>(BulletinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      inscriptionApprenantId: apprenantId,
      inscriptionAnneeId: anneeId,
      periodeScolaireId: periodeId,
      appreciation: 'Bon travail',
      decisionFinAnnee: 'ADMIS' as const,
    };

    beforeEach(() => {
      prismaMock.inscription.findUnique.mockResolvedValue({
        classeScolaireId: classeId,
      });
      prismaMock.periodescolaire.findUnique.mockResolvedValue({
        id: periodeId,
      });
      prismaMock.bulletin.findUnique.mockResolvedValue(null);
      prismaMock.classematirere.findMany.mockResolvedValue([
        { matiereId: 'math', coefficient: 2, matiere: { nom: 'Maths' } },
        { matiereId: 'fr', coefficient: 1, matiere: { nom: 'Français' } },
      ]);
      prismaMock.note.findMany.mockResolvedValue([
        { Valeur: 12, affectationenseignant: { matiereId: 'math' } },
        { Valeur: 16, affectationenseignant: { matiereId: 'math' } },
        { Valeur: 14, affectationenseignant: { matiereId: 'fr' } },
      ]);
      prismaMock.bulletin.create.mockResolvedValue({ id: 'bulletin-1' });
    });

    it('refuse une inscription inexistante', async () => {
      prismaMock.inscription.findUnique.mockResolvedValue(null);
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('refuse une période inexistante', async () => {
      prismaMock.periodescolaire.findUnique.mockResolvedValue(null);
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('refuse un bulletin déjà existant', async () => {
      prismaMock.bulletin.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(prismaMock.bulletin.create).not.toHaveBeenCalled();
    });

    it('calcule la moyenne pondérée et crée les lignes', async () => {
      await service.create(dto);
      const createArgs = (
        prismaMock.bulletin.create.mock.calls as unknown[][]
      )[0]?.[0] as {
        data: {
          moyenneGenerale: number;
          lignebulletin: {
            create: Array<{
              matiereId: string;
              moyenne: number;
              coefficient: number;
            }>;
          };
        };
      };

      expect(createArgs.data).toMatchObject({
        moyenneGenerale: 14,
        lignebulletin: {
          create: [
            { matiereId: 'math', moyenne: 14, coefficient: 2 },
            { matiereId: 'fr', moyenne: 14, coefficient: 1 },
          ],
        },
      });
    });
  });

  describe('updateRangsClasse', () => {
    it('attribue les rangs dans l’ordre des moyennes', async () => {
      prismaMock.bulletin.findMany.mockResolvedValue([
        {
          inscriptionApprenantId: 'first',
          inscriptionAnneeId: anneeId,
          periodeScolaireId: periodeId,
        },
        {
          inscriptionApprenantId: 'second',
          inscriptionAnneeId: anneeId,
          periodeScolaireId: periodeId,
        },
      ]);
      await service.updateRangsClasse(classeId, anneeId, periodeId);
      expect(prismaMock.bulletin.update).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ data: { Rang: 1 } }),
      );
      expect(prismaMock.bulletin.update).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ data: { Rang: 2 } }),
      );
    });
  });

  describe('findAll, findOne, update et remove', () => {
    it('retourne tous les bulletins', async () => {
      const bulletins = [{ id: 'bulletin-1' }];
      prismaMock.bulletin.findMany.mockResolvedValue(bulletins);
      await expect(service.findAll()).resolves.toBe(bulletins);
    });

    it('lève une erreur si le bulletin est introuvable', async () => {
      prismaMock.bulletin.findUnique.mockResolvedValue(null);
      await expect(
        service.findOne(apprenantId, anneeId, periodeId),
      ).rejects.toThrow(NotFoundException);
    });

    it('modifie un bulletin existant', async () => {
      prismaMock.bulletin.findUnique.mockResolvedValue({ id: 'bulletin-1' });
      const updated = { id: 'bulletin-1', appreciation: 'Très bien' };
      prismaMock.bulletin.update.mockResolvedValue(updated);
      await expect(
        service.update(apprenantId, anneeId, periodeId, {
          appreciation: 'Très bien',
        }),
      ).resolves.toBe(updated);
    });

    it('supprime un bulletin existant', async () => {
      prismaMock.bulletin.findUnique.mockResolvedValue({ id: 'bulletin-1' });
      const deleted = { id: 'bulletin-1' };
      prismaMock.bulletin.delete.mockResolvedValue(deleted);
      await expect(
        service.remove(apprenantId, anneeId, periodeId),
      ).resolves.toBe(deleted);
    });
  });

  describe('getBulletinDataForPdf', () => {
    it('retourne les données nécessaires au PDF', async () => {
      const bulletin = { id: 'bulletin-1' };
      const inscription = {
        apprenant: { id: apprenantId },
        anneescolaire: { nom: '2026-2027', ecole: { id: 'ecole-1' } },
        classscolaire: { id: classeId },
      };
      prismaMock.bulletin.findUnique.mockResolvedValue(bulletin);
      prismaMock.inscription.findUnique.mockResolvedValue(inscription);
      await expect(
        service.getBulletinDataForPdf({
          inscriptionApprenantId: apprenantId,
          inscriptionAnneeId: anneeId,
          periodeScolaireId: periodeId,
        }),
      ).resolves.toEqual({
        bulletin,
        ecole: inscription.anneescolaire.ecole,
        apprenant: inscription.apprenant,
        classe: inscription.classscolaire,
        anneeScolaire: inscription.anneescolaire,
      });
    });
  });

  describe('generateBulletinsForClasse', () => {
    it('comptabilise les succès et les échecs', async () => {
      prismaMock.bulletin.findMany.mockResolvedValue([]);
      prismaMock.inscription.findMany.mockResolvedValue([
        { apprenantId: 'eleve-1', anneeScolaireId: anneeId },
        { apprenantId: 'eleve-2', anneeScolaireId: anneeId },
      ]);
      jest
        .spyOn(service, 'generatePdf')
        .mockResolvedValueOnce({ documentUrl: 'url-1' } as never)
        .mockRejectedValueOnce(new Error('PDF impossible'));
      await expect(
        service.generateBulletinsForClasse(classeId, anneeId, periodeId),
      ).resolves.toMatchObject({ total: 2, generes: 1, echecs: 1 });
    });
  });
});
