import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { DossierScolariteService } from './dossier-scolarite.service';

type CreateInput = Parameters<DossierScolariteService['create']>[0];
type UpdateInput = Parameters<DossierScolariteService['update']>[2];

type PrismaMock = {
  dossierscolarite: {
    findUnique: jest.Mock;
    create: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
  };
};

describe('DossierScolariteService', () => {
  let service: DossierScolariteService;

  const prismaMock: PrismaMock = {
    dossierscolarite: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const inscriptionApprenantId = '11111111-1111-4111-8111-111111111111';
  const inscriptionAnneeId = '22222222-2222-4222-8222-222222222222';
  const configurationScolariteId = '33333333-3333-4333-8333-333333333333';

  const baseDto: CreateInput = {
    inscriptionApprenantId,
    inscriptionAnneeId,
    configurationScolariteId,
    montant: 500,
    resteAPayer: 200,
    statut: 'A_JOUR',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DossierScolariteService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<DossierScolariteService>(DossierScolariteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('rejette si un dossier existe déjà pour l’inscription', async () => {
      prismaMock.dossierscolarite.findUnique.mockResolvedValue({
        id: 'existing',
      });

      await expect(service.create(baseDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaMock.dossierscolarite.create).not.toHaveBeenCalled();
    });

    it('crée un dossier si l’inscription est libre', async () => {
      const created = { ...baseDto, id: 'dossier-1' };
      prismaMock.dossierscolarite.findUnique.mockResolvedValue(null);
      prismaMock.dossierscolarite.create.mockResolvedValue(created);

      await expect(service.create(baseDto)).resolves.toEqual(created);
      expect(prismaMock.dossierscolarite.create).toHaveBeenCalledWith({
        data: baseDto,
        include: {
          configurationscolarite: true,
          paiement: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('retourne le dossier existant', async () => {
      const dossier = {
        inscriptionApprenantId,
        inscriptionAnneeId,
        configurationScolariteId,
        montant: 500,
        resteAPayer: 200,
        statut: 'A_JOUR',
        paiement: [{ montant: 300 }],
        inscription: { apprenant: {}, classscolaire: {} },
        configurationscolarite: [],
      };

      prismaMock.dossierscolarite.findUnique.mockResolvedValue(dossier);

      await expect(
        service.findOne(inscriptionApprenantId, inscriptionAnneeId),
      ).resolves.toEqual(dossier);
    });

    it('rejette si le dossier est introuvable', async () => {
      prismaMock.dossierscolarite.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne(inscriptionApprenantId, inscriptionAnneeId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByAnnee', () => {
    it('retourne les dossiers d’une année scolaire', async () => {
      const dossiers = [{ inscriptionAnneeId, montant: 500 }];
      prismaMock.dossierscolarite.findMany.mockResolvedValue(dossiers);

      await expect(service.findByAnnee(inscriptionAnneeId)).resolves.toEqual(
        dossiers,
      );
      expect(prismaMock.dossierscolarite.findMany).toHaveBeenCalledWith({
        where: { inscriptionAnneeId },
        include: {
          inscription: {
            include: {
              apprenant: true,
              classscolaire: true,
            },
          },
          paiement: true,
        },
      });
    });
  });

  describe('update', () => {
    it('met à jour le dossier existant', async () => {
      const updated = { ...baseDto, montant: 600, resteAPayer: 100 };
      const payload: UpdateInput = {
        montant: 600,
        resteAPayer: 100,
      };

      prismaMock.dossierscolarite.findUnique.mockResolvedValue({
        inscriptionApprenantId,
        inscriptionAnneeId,
      });
      prismaMock.dossierscolarite.update.mockResolvedValue(updated);

      await expect(
        service.update(inscriptionApprenantId, inscriptionAnneeId, payload),
      ).resolves.toEqual(updated);
      expect(prismaMock.dossierscolarite.update).toHaveBeenCalledWith({
        where: {
          inscriptionApprenantId_inscriptionAnneeId: {
            inscriptionApprenantId,
            inscriptionAnneeId,
          },
        },
        data: payload,
      });
    });
  });

  describe('recalculerSolde', () => {
    it('met à jour le solde et le statut à jour', async () => {
      const dossier = {
        inscriptionApprenantId,
        inscriptionAnneeId,
        montant: 500,
        paiement: [{ montant: 150 }, { montant: 100 }],
      };
      const updated = {
        ...dossier,
        resteAPayer: 250,
        statut: 'A_JOUR',
      };

      prismaMock.dossierscolarite.findUnique.mockResolvedValue(dossier);
      prismaMock.dossierscolarite.update.mockResolvedValue(updated);

      await expect(
        service.recalculerSolde(inscriptionApprenantId, inscriptionAnneeId),
      ).resolves.toEqual(updated);
      expect(prismaMock.dossierscolarite.update).toHaveBeenCalledWith({
        where: {
          inscriptionApprenantId_inscriptionAnneeId: {
            inscriptionApprenantId,
            inscriptionAnneeId,
          },
        },
        data: {
          resteAPayer: 250,
          statut: 'A_JOUR',
        },
      });
    });

    it('passe le dossier à SOLDEE quand le montant est intégralement payé', async () => {
      const dossier = {
        inscriptionApprenantId,
        inscriptionAnneeId,
        montant: 300,
        paiement: [{ montant: 150 }, { montant: 150 }],
      };
      const updated = {
        ...dossier,
        resteAPayer: 0,
        statut: 'SOLDEE',
      };

      prismaMock.dossierscolarite.findUnique.mockResolvedValue(dossier);
      prismaMock.dossierscolarite.update.mockResolvedValue(updated);

      await expect(
        service.recalculerSolde(inscriptionApprenantId, inscriptionAnneeId),
      ).resolves.toEqual(updated);
      expect(prismaMock.dossierscolarite.update).toHaveBeenCalledWith({
        where: {
          inscriptionApprenantId_inscriptionAnneeId: {
            inscriptionApprenantId,
            inscriptionAnneeId,
          },
        },
        data: {
          resteAPayer: 0,
          statut: 'SOLDEE',
        },
      });
    });
  });
});
