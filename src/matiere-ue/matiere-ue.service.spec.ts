import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { MatiereUeService } from './matiere-ue.service';
import type {
  AddMatiereToUeDto,
  UpdateMatiereCoefficientDto,
} from './dto/matiereue.dto';

describe('MatiereUeService', () => {
  let service: MatiereUeService;

  const txMock = {
    matiereue: {
      aggregate: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    uniteenseignement: {
      update: jest.fn(),
    },
  };

  const prismaMock = {
    uniteenseignement: {
      findFirst: jest.fn(),
    },
    matiere: {
      findFirst: jest.fn(),
    },
    matiereue: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const ecoleId = '11111111-1111-4111-8111-111111111111';
  const ueId = '22222222-2222-4222-8222-222222222222';
  const matiereId = '33333333-3333-4333-8333-333333333333';

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation(
      (callback: (tx: typeof txMock) => Promise<unknown>) => callback(txMock),
    );
    txMock.matiereue.aggregate.mockResolvedValue({
      _sum: { coefficient: 5 },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatiereUeService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<MatiereUeService>(MatiereUeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addMatiere', () => {
    const dto: AddMatiereToUeDto = { matiereId, coefficient: 2 };

    it('ajoute la matière et recalcule le coefficient de l’UE', async () => {
      const relation = { uniteEnseignementId: ueId, matiereId };
      prismaMock.uniteenseignement.findFirst.mockResolvedValue({ id: ueId });
      prismaMock.matiere.findFirst.mockResolvedValue({ id: matiereId });
      prismaMock.matiereue.findUnique.mockResolvedValue(null);
      txMock.matiereue.create.mockResolvedValue(relation);

      await expect(service.addMatiere(ecoleId, ueId, dto)).resolves.toBe(
        relation,
      );
      expect(txMock.matiereue.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            uniteEnseignementId: ueId,
            matiereId,
            coefficient: 2,
          },
        }),
      );
      expect(txMock.matiereue.aggregate).toHaveBeenCalledWith({
        where: { uniteEnseignementId: ueId },
        _sum: { coefficient: true },
      });
      expect(txMock.uniteenseignement.update).toHaveBeenCalledWith({
        where: { id: ueId },
        data: { coefficient: 5 },
      });
    });

    it('lève NotFoundException si l’UE est absente de l’école', async () => {
      prismaMock.uniteenseignement.findFirst.mockResolvedValue(null);

      await expect(service.addMatiere(ecoleId, ueId, dto)).rejects.toThrow(
        new NotFoundException(
          "Unité d'enseignement introuvable pour cette école.",
        ),
      );
      expect(prismaMock.matiere.findFirst).not.toHaveBeenCalled();
    });

    it('refuse une association déjà existante', async () => {
      prismaMock.uniteenseignement.findFirst.mockResolvedValue({ id: ueId });
      prismaMock.matiere.findFirst.mockResolvedValue({ id: matiereId });
      prismaMock.matiereue.findUnique.mockResolvedValue({
        uniteEnseignementId: ueId,
        matiereId,
      });

      await expect(service.addMatiere(ecoleId, ueId, dto)).rejects.toThrow(
        new ConflictException('Cette matière est déjà associée à cette UE.'),
      );
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('findMatieresByUe', () => {
    it('retourne les relations de matières de l’UE', async () => {
      const response = [{ matiereId }];
      prismaMock.uniteenseignement.findFirst.mockResolvedValue({
        id: ueId,
        matiereue: response,
      });

      await expect(service.findMatieresByUe(ecoleId, ueId)).resolves.toBe(
        response,
      );
      expect(prismaMock.uniteenseignement.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: ueId,
            matiereue: {
              some: { matiere: { ecoleId } },
            },
          },
        }),
      );
    });
  });

  describe('updateMatiereCoefficient', () => {
    it('met à jour le coefficient et recalcule le total', async () => {
      const dto: UpdateMatiereCoefficientDto = { coefficient: 4 };
      const response = { uniteEnseignementId: ueId, matiereId, coefficient: 4 };
      prismaMock.matiereue.findFirst.mockResolvedValue({
        uniteEnseignementId: ueId,
        matiereId,
      });
      txMock.matiereue.update.mockResolvedValue(response);

      await expect(
        service.updateMatiereCoefficient(ecoleId, ueId, matiereId, dto),
      ).resolves.toBe(response);
      expect(txMock.matiereue.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            uniteEnseignementId_matiereId: {
              uniteEnseignementId: ueId,
              matiereId,
            },
          },
          data: { coefficient: 4 },
        }),
      );
      expect(txMock.uniteenseignement.update).toHaveBeenCalled();
    });
  });

  describe('removeMatiere', () => {
    it('supprime la relation et recalcule le total', async () => {
      const relation = { uniteEnseignementId: ueId, matiereId };
      prismaMock.matiereue.findFirst.mockResolvedValue(relation);
      txMock.matiereue.delete.mockResolvedValue(relation);

      await expect(
        service.removeMatiere(ecoleId, ueId, matiereId),
      ).resolves.toBe(relation);
      expect(txMock.matiereue.delete).toHaveBeenCalledWith({
        where: {
          uniteEnseignementId_matiereId: {
            uniteEnseignementId: ueId,
            matiereId,
          },
        },
      });
      expect(txMock.uniteenseignement.update).toHaveBeenCalled();
    });

    it('lève NotFoundException si la relation est absente', async () => {
      prismaMock.matiereue.findFirst.mockResolvedValue(null);

      await expect(
        service.removeMatiere(ecoleId, ueId, matiereId),
      ).rejects.toThrow(
        new NotFoundException(
          'Association entre cette matière et cette UE introuvable pour cette école.',
        ),
      );
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });
  });
});
