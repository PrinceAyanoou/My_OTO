import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaiementService } from './paiement.service';
import type { CreatePaiementDto, UpdatePaiementDto } from './dto/paiement.dto';

describe('PaiementService', () => {
  let service: PaiementService;

  const txMock = {
    paiement: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    dossierscolarite: {
      update: jest.fn(),
    },
  };

  const prismaMock = {
    dossierscolarite: {
      findFirst: jest.fn(),
    },
    paiement: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const ecoleId = '11111111-1111-4111-8111-111111111111';
  const dossierId = '22222222-2222-4222-8222-222222222222';
  const paiementId = '33333333-3333-4333-8333-333333333333';

  const dossier = {
    id: dossierId,
    resteAPayer: 1000,
    statut: 'EN_RETARD',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation(
      (callback: (tx: typeof txMock) => Promise<unknown>) => callback(txMock),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaiementService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<PaiementService>(PaiementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto: CreatePaiementDto = {
      montant: 1000,
      datePaiement: '2026-09-17',
      moyenPaiement: 'ESPECES',
      dossierScolariteId: dossierId,
    };

    it('crée le paiement et solde le dossier si nécessaire', async () => {
      const response = { id: paiementId, montant: dto.montant };
      prismaMock.dossierscolarite.findFirst.mockResolvedValue(dossier);
      txMock.paiement.create.mockResolvedValue(response);

      await expect(service.create(ecoleId, dto)).resolves.toBe(response);
      expect(txMock.paiement.create).toHaveBeenCalledWith({
        data: {
          montant: 1000,
          datePaiement: '2026-09-17',
          moyenPaiement: 'ESPECES',
          references: undefined,
          recuUrl: undefined,
          dossierScolariteId: dossierId,
        },
      });
      expect(txMock.dossierscolarite.update).toHaveBeenCalledWith({
        where: { id: dossierId },
        data: { resteAPayer: 0, statut: 'SOLDEE' },
      });
    });

    it('refuse un montant supérieur au reste à payer', async () => {
      prismaMock.dossierscolarite.findFirst.mockResolvedValue(dossier);

      await expect(
        service.create(ecoleId, { ...dto, montant: 1001 }),
      ).rejects.toThrow(
        new BadRequestException(
          'Le montant du paiement (1001) ne peut pas dépasser le reste à payer (1000).',
        ),
      );
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('lève NotFoundException si le dossier est absent de l’école', async () => {
      prismaMock.dossierscolarite.findFirst.mockResolvedValue(null);

      await expect(service.create(ecoleId, dto)).rejects.toThrow(
        new NotFoundException(
          "Le dossier scolaire est introuvable ou n'appartient pas à cette école.",
        ),
      );
    });
  });

  describe('findAll', () => {
    it('retourne les paiements appartenant à l’école', async () => {
      const response = [{ id: paiementId }];
      prismaMock.paiement.findMany.mockResolvedValue(response);

      await expect(service.findAll(ecoleId)).resolves.toBe(response);
      expect(prismaMock.paiement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            dossierscolarite: {
              inscription: { anneescolaire: { ecoleId } },
            },
          },
          orderBy: { datePaiement: 'desc' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('lève NotFoundException si le paiement est introuvable', async () => {
      prismaMock.paiement.findFirst.mockResolvedValue(null);

      await expect(service.findOne(ecoleId, paiementId)).rejects.toThrow(
        new NotFoundException(
          "Le paiement est introuvable ou n'appartient pas à cette école.",
        ),
      );
    });
  });

  describe('update', () => {
    it('modifie les informations sans recalculer si le montant est absent', async () => {
      const dto: UpdatePaiementDto = {
        moyenPaiement: 'BANQUE',
        references: 'REF-1',
      };
      const paiement = {
        id: paiementId,
        montant: 300,
        dossierScolariteId: dossierId,
      };
      const response = { id: paiementId, ...dto };
      prismaMock.paiement.findFirst.mockResolvedValue({
        ...paiement,
        dossierscolarite: dossier,
      });
      prismaMock.paiement.update.mockResolvedValue(response);

      await expect(service.update(ecoleId, paiementId, dto)).resolves.toBe(
        response,
      );
      expect(prismaMock.paiement.update).toHaveBeenCalledWith({
        where: { id: paiementId },
        data: {
          datePaiement: undefined,
          moyenPaiement: 'BANQUE',
          references: 'REF-1',
          recuUrl: undefined,
        },
      });
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('recalcule le reste lorsque le montant change', async () => {
      const dto: UpdatePaiementDto = { montant: 500 };
      const paiement = {
        id: paiementId,
        montant: 300,
        dossierScolariteId: dossierId,
      };
      const response = { id: paiementId, montant: 500 };
      prismaMock.paiement.findFirst.mockResolvedValue({
        ...paiement,
        dossierscolarite: dossier,
      });
      txMock.paiement.update.mockResolvedValue(response);

      await expect(service.update(ecoleId, paiementId, dto)).resolves.toBe(
        response,
      );
      expect(txMock.dossierscolarite.update).toHaveBeenCalledWith({
        where: { id: dossierId },
        data: { resteAPayer: 800, statut: 'EN_RETARD' },
      });
    });
  });

  describe('remove', () => {
    it('supprime le paiement et réajuste le reste à payer', async () => {
      const paiement = {
        id: paiementId,
        montant: 300,
        dossierScolariteId: dossierId,
      };
      prismaMock.paiement.findFirst.mockResolvedValue({
        ...paiement,
        dossierscolarite: { ...dossier, resteAPayer: 700 },
      });
      txMock.paiement.delete.mockResolvedValue({ id: paiementId });

      await expect(service.remove(ecoleId, paiementId)).resolves.toEqual({
        message: 'Le paiement a été supprimé avec succès.',
      });
      expect(txMock.dossierscolarite.update).toHaveBeenCalledWith({
        where: { id: dossierId },
        data: { resteAPayer: 1000, statut: 'A_JOUR' },
      });
    });
  });
});
